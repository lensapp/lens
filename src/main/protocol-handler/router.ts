import { Singleton } from "../../common/utils";
import Url from "url-parse";
import { match, matchPath } from "react-router";
import { pathToRegexp } from "path-to-regexp";
import { subscribeToBroadcast } from "../../common/ipc";
import logger from "../logger";

export enum RoutingErrorType {
  INVALID_PROTOCOL = "invalid-protocol",
  INVALID_HOST = "invalid-host",
  INVALID_PATHNAME = "invalid-pathname",
  NO_HANDLER = "no-handler",
  NO_EXTENSION_ID = "no-ext-id",
  MISSING_EXTENSION = "missing-ext",
}

export class RoutingError extends Error {
  constructor(public type: RoutingErrorType, public url: Url) {
    super();
  }

  toString() {
    switch (this.type) {
      case RoutingErrorType.INVALID_HOST:
        return "invalid host";
      case RoutingErrorType.INVALID_PROTOCOL:
        return "invalid protocol";
      case RoutingErrorType.INVALID_PATHNAME:
        return "invalid pathname";
      case RoutingErrorType.NO_HANDLER:
        return "no handler";
      case RoutingErrorType.NO_EXTENSION_ID:
        return "no extension ID";
      case RoutingErrorType.MISSING_EXTENSION:
        return "extension not found";
    }
  }
}

export interface RouteParams {
  search: Record<string, string>;
  pathname: Record<string, string>;
}

export type RouteHandler = (params: RouteParams) => void;

export type ExtensionId = string;

const EXTENSION_PUBLISHER_MATCH = "LENS_INTERNAL_EXTENSION_PUBLISHER_MATCH";
const EXTENSION_NAME_MATCH = "LENS_INTERNAL_EXTENSION_NAME_MATCH";

// IPC channel for protocol actions. Main broadcasts the open-url events to this channel.
export const lensProtocolChannel = "protocol-handler";

interface ExtensionUrlMatch {
  [EXTENSION_PUBLISHER_MATCH]: string;
  [EXTENSION_NAME_MATCH]: string;
}

export class LensProtocolRouter extends Singleton {
  private extentionRoutes = new Map<ExtensionId, Map<string, RouteHandler>>();
  private internalRoutes = new Map<string, RouteHandler>();

  private missingExtensionHandler?: (name: string) => Promise<boolean>;

  private static readonly LoggingPrefix = "[PROTOCOL ROUTER]";
  private static ExtensionUrlSchema = `/:${EXTENSION_PUBLISHER_MATCH}/:${EXTENSION_NAME_MATCH}`;

  public init() {
    subscribeToBroadcast(lensProtocolChannel, ((_event, { rawUrl }) => {
      logger.info(`receiving: ${rawUrl}`);

      try {
        this.route(Url(rawUrl, true));
      } catch (error) {
        if (error instanceof RoutingError) {
          logger.error(`${LensProtocolRouter.LoggingPrefix}: ${error}`, { url: error.url });
        } else {
          logger.error(`${LensProtocolRouter.LoggingPrefix}: ${error}`, { rawUrl });
        }
      }
    }));
  }

  /**
   * route
   */
  public async route(url: Url): Promise<void> {
    if (url.protocol.toLowerCase() !== "lens:") {
      throw new RoutingError(RoutingErrorType.INVALID_PROTOCOL, url);
    }

    switch (url.host) {
      case "internal":
        return this._route(this.internalRoutes, url);
      case "extension":
        return this._routeToExtension(url);
      default:
        throw new RoutingError(RoutingErrorType.INVALID_HOST, url);

    }
  }

  private async _routeToExtension(url: Url) {
    const match = matchPath<ExtensionUrlMatch>(url.pathname, LensProtocolRouter.ExtensionUrlSchema);

    if (!match) {
      throw new RoutingError(RoutingErrorType.NO_EXTENSION_ID, url);
    }

    const { [EXTENSION_PUBLISHER_MATCH]: publisher, [EXTENSION_NAME_MATCH]: partialName } = match.params;
    const name = `${publisher}/${partialName}`;

    logger.info(`${LensProtocolRouter.LoggingPrefix}: Extension ${name} matched`);

    let routes = this.extentionRoutes.get(name);

    if (!routes) {
      if (this.missingExtensionHandler) {

        if (!await this.missingExtensionHandler(name)) {
          return;
        }

        routes = this.extentionRoutes.get(name);

        if (!routes) {
          logger.info(`${LensProtocolRouter.LoggingPrefix}: Extension ${name} matched, but has no routes`);

          return;
        }
      } else {
        throw new RoutingError(RoutingErrorType.MISSING_EXTENSION, url);
      }
    }

    this._route(routes, url, true);
  }

  private _route(routes: Map<string, RouteHandler>, url: Url, matchExtension = false): void {
    const matches = Array.from(routes.entries())
      .map(([schema, handler]): [match<Record<string, string>>, RouteHandler] => {
        if (matchExtension) {
          const joinChar = schema.startsWith("/") ? "" : "/";

          schema = `${LensProtocolRouter.ExtensionUrlSchema}${joinChar}${schema}`;
        }

        return [matchPath(url.pathname, { path: schema }), handler];
      })
      .filter(([match]) => match);
    // prefer an exact match, but if not pick the first route registered
    const route = matches.find(([match]) => match.isExact) ?? matches[0];

    if (!route) {
      throw new RoutingError(RoutingErrorType.NO_HANDLER, url);
    }

    logger.info(`${LensProtocolRouter.LoggingPrefix}: routing ${url.toString()}`);

    const [match, handler] = route;

    delete match.params[EXTENSION_NAME_MATCH];
    delete match.params[EXTENSION_PUBLISHER_MATCH];
    handler({
      pathname: match.params,
      search: url.query,
    });
  }

  public on(urlSchema: string, handler: RouteHandler): void {
    pathToRegexp(urlSchema); // verify now that the schema is valid
    logger.info(`${LensProtocolRouter.LoggingPrefix}: internal registering ${urlSchema}`);
    this.internalRoutes.set(urlSchema, handler);
  }

  public extensionOn(id: ExtensionId, urlSchema: string, handler: RouteHandler): void {
    logger.info(`${LensProtocolRouter.LoggingPrefix}: extension ${id} registering ${urlSchema}`);
    pathToRegexp(urlSchema); // verify now that the schema is valid

    if (!this.extentionRoutes.has(id)) {
      this.extentionRoutes.set(id, new Map());
    }

    if (urlSchema.includes(`:${EXTENSION_NAME_MATCH}`)) {
      throw new TypeError("Invalid url path schema");
    }

    this.extentionRoutes.get(id).set(urlSchema, handler);
  }

  public removeExtensionHandlers(id: ExtensionId): void {
    this.extentionRoutes.get(id)?.clear();
  }

  /**
   * onMissingExtension registers the handler for when an extension is missing
   * @param handler If the called handler resolves to true then the routes will be tried again
   */
  public onMissingExtension(handler: (name: string) => Promise<boolean>) {
    this.missingExtensionHandler = handler;
  }
}
