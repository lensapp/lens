/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { match } from "react-router";
import { matchPath } from "react-router";
import { countBy } from "lodash";
import { isDefined, iter } from "../utils";
import type Url from "url-parse";
import { RoutingError, RoutingErrorType } from "./error";
import type { ExtensionsStore } from "../../extensions/extensions-store/extensions-store";
import type { LensExtension } from "../../extensions/lens-extension";
import type { RouteHandler, RouteParams } from "./registration";
import type { IComputedValue } from "mobx";
import { when } from "mobx";
import type { Logger } from "../logger";
import type { FindExtensionInstanceByName } from "../../features/extensions/loader/common/find-instance-by-name.injectable";

export const ProtocolHandlerInternal = `protocol-handler:internal`;
export const ProtocolHandlerExtension = `protocol-handler:extension`;
export const ProtocolHandlerInvalid = `protocol-handler:invalid`;

/**
 * These two names are long and cumbersome by design so as to decrease the chances
 * of an extension using the same names.
 *
 * Though under the current (2021/01/18) implementation, these are never matched
 * against in the final matching so their names are less of a concern.
 */
export const EXTENSION_PUBLISHER_MATCH = "LENS_INTERNAL_EXTENSION_PUBLISHER_MATCH";
export const EXTENSION_NAME_MATCH = "LENS_INTERNAL_EXTENSION_NAME_MATCH";

/**
 * Returned from routing attempts
 */
export enum RouteAttempt {
  /**
   * A handler was found in the set of registered routes
   */
  MATCHED = "matched",
  /**
   * A handler was not found within the set of registered routes
   */
  MISSING = "missing",
  /**
   * The extension that was matched in the route was not activated
   */
  MISSING_EXTENSION = "no-extension",
}

export function foldAttemptResults(mainAttempt: RouteAttempt, rendererAttempt: RouteAttempt): RouteAttempt {
  switch (mainAttempt) {
    case RouteAttempt.MATCHED:
      return RouteAttempt.MATCHED;
    case RouteAttempt.MISSING:
    case RouteAttempt.MISSING_EXTENSION:
      return rendererAttempt;
  }
}

export interface LensProtocolRouterDependencies {
  readonly extensionsStore: ExtensionsStore;
  readonly logger: Logger;
  readonly internalRoutes: IComputedValue<Map<string, RouteHandler>>;
  findExtensionInstanceByName: FindExtensionInstanceByName;
}

export const extensionUrlDeepLinkingSchema = `/:${EXTENSION_PUBLISHER_MATCH}(@[A-Za-z0-9_]+)?/:${EXTENSION_NAME_MATCH}`;

export class LensProtocolRouter {
  constructor(protected readonly dependencies: LensProtocolRouterDependencies) {}

  /**
   * Attempts to route the given URL to all internal routes that have been registered
   * @param url the parsed URL that initiated the `lens://` protocol
   * @returns true if a route has been found
   */
  routeToInternal(url: Url<Record<string, string | undefined>>): RouteAttempt {
    return this._route(this.dependencies.internalRoutes.get().entries(), url);
  }

  /**
   * match against all matched URIs, returning either the first exact match or
   * the most specific match if none are exact.
   * @param routes the array of path schemas, handler pairs to match against
   * @param url the url (in its current state)
   */
  protected _findMatchingRoute(routes: Iterable<[string, RouteHandler]>, url: Url<Record<string, string | undefined>>): null | [match<Record<string, string>>, RouteHandler] {
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
    return matches.sort(([a], [b]) => {
      if (a.path === "/") {
        return 1;
      }

      if (b.path === "/") {
        return -1;
      }

      return countBy(b.path)["/"] - countBy(a.path)["/"];
    })[0] ?? null;
  }

  /**
   * find the most specific matching handler and call it
   * @param routes the array of (path schemas, handler) pairs to match against
   * @param url the url (in its current state)
   */
  protected _route(routes: Iterable<[string, RouteHandler]>, url: Url<Record<string, string | undefined>>, extensionName?: string): RouteAttempt {
    const route = this._findMatchingRoute(routes, url);

    if (!route) {
      const data: Record<string, string> = { url: url.toString() };

      if (extensionName) {
        data.extensionName = extensionName;
      }

      this.dependencies.logger.info(`No handler found`, data);

      return RouteAttempt.MISSING;
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

    return RouteAttempt.MATCHED;
  }

  /**
   * Tries to find the matching LensExtension instance
   *
   * Note: this needs to be async so that `main`'s overloaded version can also be async
   * @param url the protocol request URI that was "open"-ed
   * @returns either the found name or the instance of `LensExtension`
   */
  protected async _findMatchingExtensionByName(url: Url<Record<string, string | undefined>>): Promise<LensExtension | string> {
    interface ExtensionUrlMatch {
      [EXTENSION_PUBLISHER_MATCH]: string;
      [EXTENSION_NAME_MATCH]: string;
    }

    const match = matchPath<ExtensionUrlMatch>(url.pathname, extensionUrlDeepLinkingSchema);

    if (!match) {
      throw new RoutingError(RoutingErrorType.NO_EXTENSION_ID, url);
    }

    const { [EXTENSION_PUBLISHER_MATCH]: publisher, [EXTENSION_NAME_MATCH]: partialName } = match.params;
    const name = [publisher, partialName].filter(isDefined).join("/");

    try {
      await when(() => this.dependencies.findExtensionInstanceByName(name) !== "not-installed", {
        timeout: 5_000,
      });
    } catch (error) {
      this.dependencies.logger.info(
        `Extension ${name} matched, but not installed (${error})`,
      );

      return name;
    }

    const extension = this.dependencies.findExtensionInstanceByName(name);

    if (typeof extension === "string") {
      this.dependencies.logger.info(`Extension ${name} matched, but ${extension}`);

      return name;
    }

    if (!extension.isBundled && !this.dependencies.extensionsStore.isEnabled(extension.id)) {
      this.dependencies.logger.info(`Extension ${name} matched, but not enabled`);

      return name;
    }

    this.dependencies.logger.info(`Extension ${name} matched`);

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
  async routeToExtension(url: Url<Record<string, string | undefined>>): Promise<RouteAttempt> {
    const extension = await this._findMatchingExtensionByName(url);

    if (typeof extension === "string") {
      // failed to find an extension, it returned its name
      return RouteAttempt.MISSING_EXTENSION;
    }

    // remove the extension name from the path name so we don't need to match on it anymore
    url.set("pathname", url.pathname.slice(extension.name.length + 1));

    try {
      const handlers = iter.map(extension.protocolHandlers, ({ pathSchema, handler }) => [pathSchema, handler] as [string, RouteHandler]);

      return this._route(handlers, url, extension.name);
    } catch (error) {
      if (error instanceof RoutingError) {
        error.extensionName = extension.name;
      }

      throw error;
    }
  }
}
