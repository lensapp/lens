import { match, matchPath } from "react-router";
import { countBy } from "lodash";
import { Singleton } from "../utils";
import { pathToRegexp } from "path-to-regexp";
import logger from "../../main/logger";
import Url from "url-parse";
import { RoutingError, RoutingErrorType } from "./error";
import { extensionsStore } from "../../extensions/extensions-store";
import { extensionLoader } from "../../extensions/extension-loader";
import { LensExtension } from "../../extensions/lens-extension";

// IPC channel for protocol actions. Main broadcasts the open-url events to this channel.
export const ProtocolHandlerIpcPrefix = "protocol-handler";

export const ProtocolHandlerInternal = `${ProtocolHandlerIpcPrefix}:internal`;
export const ProtocolHandlerExtension= `${ProtocolHandlerIpcPrefix}:extension`;

/**
 * These two names are long and cubersome by design so as to decrease the chances
 * of an extension using the same names.
 *
 * Though under the current (2021/01/18) implementation, these are never matched
 * against in the final matching so their names are less of a concern.
 */
const EXTENSION_PUBLISHER_MATCH = "LENS_INTERNAL_EXTENSION_PUBLISHER_MATCH";
const EXTENSION_NAME_MATCH = "LENS_INTERNAL_EXTENSION_NAME_MATCH";

/**
 * The collection of the dynamic parts of a URI which initiated a `lens://`
 * protocol request
 */
export interface RouteParams {
  /**
   * the parts of the URI query string
   */
  search: Record<string, string>;

  /**
   * the matching parts of the path. The dynamic parts of the URI path.
   */
  pathname: Record<string, string>;

  /**
   * if the most specific path schema that is matched does not cover the whole
   * of the URI's path. Then this field will be set to the remaining path
   * segments.
   *
   * Example:
   *
   * If the path schema `/landing/:type` is the matched schema for the URI
   * `/landing/soft/easy` then this field will be set to `"/easy"`.
   */
  tail?: string;
}

/**
 * RouteHandler represents the function signature of the handler function for
 * `lens://` protocol routing.
 */
export interface RouteHandler {
  (params: RouteParams): void;
}

export abstract class LensProtocolRouter extends Singleton {
  // Map between path schemas and the handlers
  protected internalRoutes = new Map<string, RouteHandler>();

  public static readonly LoggingPrefix = "[PROTOCOL ROUTER]";

  protected static readonly ExtensionUrlSchema = `/:${EXTENSION_PUBLISHER_MATCH}(\@[A-Za-z0-9_]+)?/:${EXTENSION_NAME_MATCH}`;

  /**
   *
   * @param url the parsed URL that initiated the `lens://` protocol
   */
  protected _routeToInternal(url: Url): void {
    this._route(Array.from(this.internalRoutes.entries()), url);
  }

  /**
   * match against all matched URIs, returning either the first exact match or
   * the most specific match if none are exact.
   * @param routes the array of path schemas, handler pairs to match against
   * @param url the url (in its current state)
   */
  protected _findMatchingRoute(routes: [string, RouteHandler][], url: Url): null | [match<Record<string, string>>, RouteHandler] {
    const matches: [match<Record<string, string>>, RouteHandler][] = [];

    for (const [schema, handler] of routes) {
      const match = matchPath(url.pathname, { path: schema });

      if (!match) {
        continue;
      }

      // prefer an exact match
      if (match.isExact) {
        return [match, handler];
      }

      matches.push([match, handler]);
    }

    // if no exact match pick the one that is the most specific
    return matches.sort(([a], [b]) => compareMatches(a, b))[0] ?? null;
  }

  /**
   * find the most specific matching handler and call it
   * @param routes the array of (path schemas, handler) paris to match against
   * @param url the url (in its current state)
   */
  protected _route(routes: [string, RouteHandler][], url: Url): void {
    const route = this._findMatchingRoute(routes, url);

    if (!route) {
      throw new RoutingError(RoutingErrorType.NO_HANDLER, url);
    }

    const [match, handler] = route;

    const params: RouteParams = {
      pathname: match.params,
      search: url.query,
    };

    if (!match.isExact) {
      params.tail = url.pathname.slice(match.url.length);
    }

    handler(params);
  }

  /**
   * Tries to find the matching LensExtension instance
   *
   * Note: this needs to be async so that `main`'s overloaded version can also be async
   * @param url the protocol request URI that was "open"-ed
   * @returns either the found name or the instance of `LensExtension`
   */
  protected async _findMatchingExtensionByName(url: Url): Promise<LensExtension | string> {
    interface ExtensionUrlMatch {
      [EXTENSION_PUBLISHER_MATCH]: string;
      [EXTENSION_NAME_MATCH]: string;
    }

    const match = matchPath<ExtensionUrlMatch>(url.pathname, LensProtocolRouter.ExtensionUrlSchema);

    if (!match) {
      throw new RoutingError(RoutingErrorType.NO_EXTENSION_ID, url);
    }

    const { [EXTENSION_PUBLISHER_MATCH]: publisher, [EXTENSION_NAME_MATCH]: partialName } = match.params;
    const name = [publisher, partialName].filter(Boolean).join("/");

    const extension = extensionLoader.userExtensionsByName.get(name);

    if (!extension) {
      logger.info(`${LensProtocolRouter.LoggingPrefix}: Extension ${name} matched, but not installed`);

      return name;
    }

    if (!extensionsStore.isEnabled(extension.id)) {
      logger.info(`${LensProtocolRouter.LoggingPrefix}: Extension ${name} matched, but not enabled`);

      return name;
    }

    logger.info(`${LensProtocolRouter.LoggingPrefix}: Extension ${name} matched`);

    return extension;
  }

  /**
   * Find a matching extension by the first one or two path segments of `url` and then try to `_route`
   * its correspondingly registered handlers.
   *
   * If no handlers are found or the extension is not enabled then `_missingHandlers` is called before
   * checking if more handlers have been added.
   *
   * Note: this function modifies its argument, do not reuse
   * @param url the protocol request URI that was "open"-ed
   */
  protected async _routeToExtension(url: Url): Promise<void> {
    const extension = await this._findMatchingExtensionByName(url);

    if (typeof extension === "string") {
      // failed to find an extension, it returned its name
      return;
    }

    // remove the extension name from the path name so we don't need to match on it anymore
    url.set("pathname", url.pathname.slice(extension.name.length));

    const handlers = extension
      .protocolHandlers
      .map<[string, RouteHandler]>(({ pathSchema, handler }) => [pathSchema, handler]);

    try {
      this._route(handlers, url);
    } catch (error) {
      if (error instanceof RoutingError) {
        error.extensionName = extension.name;
      }

      throw error;
    }
  }

  /**
   * Add a handler under the `lens://internal` tree of routing.
   * @param pathSchema the URI path schema to match against for this handler
   * @param handler a function that will be called if a protocol path matches
   */
  public addInternalHandler(urlSchema: string, handler: RouteHandler): void {
    pathToRegexp(urlSchema); // verify now that the schema is valid
    logger.info(`${LensProtocolRouter.LoggingPrefix}: internal registering ${urlSchema}`);
    this.internalRoutes.set(urlSchema, handler);
  }

  /**
   * Remove an internal protocol handler.
   * @param pathSchema the path schema that the handler was registered under
   */
  public removeInternalHandler(urlSchema: string): void {
    this.internalRoutes.delete(urlSchema);
  }
}

/**
 * a comparison function for `array.sort(...)`. Sort order should be most path
 * parts to least path parts.
 * @param a the left side to compare
 * @param b the right side to compare
 */
function compareMatches<T>(a: match<T>, b: match<T>): number {
  if (a.path === "/") {
    return 1;
  }

  if (b.path === "/") {
    return -1;
  }

  return countBy(b.path)["/"] - countBy(a.path)["/"];
}
