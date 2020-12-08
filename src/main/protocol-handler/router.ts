import { Singleton } from "../../common/utils";
import Url from "url-parse";
import { match, matchPath } from "react-router";

export enum RoutingErrorType {
  INVALID_PROTOCOL = "invalid-protocol",
  INVALID_HOST = "invalid-host",
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

const EXT_ID_MATCH = "LENS_INTERNAL_EXTENSION_ID_MATCH";

interface ExtensionIdMatch {
  [EXT_ID_MATCH]: string;
}

export class LensProtocolRouter extends Singleton {
  private exentionRoutes = new Map<ExtensionId, Map<string, RouteHandler>>();
  private internalRoutes = new Map<string, RouteHandler>();

  private static ExtensionIDSchema = `/:${EXT_ID_MATCH}/`;

  /**
   * route
   */
  public route(url: Url): void {
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

  private _routeToExtension(url: Url): void {
    const match = matchPath<ExtensionIdMatch>(url.pathname, { path: LensProtocolRouter.ExtensionIDSchema });

    if (!match) {
      throw new RoutingError(RoutingErrorType.NO_EXTENSION_ID, url);
    }

    const { [EXT_ID_MATCH]: id } = match.params;
    const routes = this.exentionRoutes.get(id);

    if (!routes) {
      throw new RoutingError(RoutingErrorType.MISSING_EXTENSION, url);
    }

    this._route(routes, url, true);
  }

  private _route(routes: Map<string, RouteHandler>, url: Url, matchExtension = false): void {
    const matches = Array.from(routes.entries())
      .map(([schema, handler]): [match<Record<string, string>>, RouteHandler] => {
        const path = `${matchExtension ? LensProtocolRouter.ExtensionIDSchema : ""}${schema}`;

        return [matchPath(url.pathname, { path }), handler];
      })
      .filter(([match]) => match);
    // prefer an exact match, but if not pick the first route registered
    const route = matches.find(([match]) => match.isExact) ?? matches[0];

    if (!route) {
      throw new RoutingError(RoutingErrorType.NO_HANDLER, url);
    }

    const [match, handler] = route;

    delete match.params[EXT_ID_MATCH];
    handler({
      pathname: match.params,
      search: url.query,
    });
  }

  public on(urlSchema: string, handler: RouteHandler): void {
    this.internalRoutes.set(urlSchema, handler);
  }

  public extensionOn(id: ExtensionId, urlSchema: string, handler: RouteHandler): void {
    if (!this.exentionRoutes.has(id)) {
      this.exentionRoutes.set(id, new Map());
    }

    if (urlSchema.includes(`:${EXT_ID_MATCH}`)) {
      throw new TypeError("Invalid url path schema");
    }

    this.exentionRoutes.get(id).set(urlSchema, handler);
  }
}
