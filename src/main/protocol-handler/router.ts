import { Singleton } from "../../common/utils";
import Url from "url-parse";
import { match, matchPath } from "react-router";

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

const EXT_ID_MATCH = "LENS_INTERNAL_EXTENSION_ID_MATCH";

interface ExtensionIdMatch {
  [EXT_ID_MATCH]: string;
}

export class LensProtocolRouter extends Singleton {
  private extentionRoutes = new Map<ExtensionId, Map<string, RouteHandler>>();
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
      case "main":
        return this._routeToMain(url);
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
    const routes = this.extentionRoutes.get(id);

    if (!routes) {
      throw new RoutingError(RoutingErrorType.MISSING_EXTENSION, url);
    }

    this._route(routes, url, true);
  }

  private _routeToMain(url: Url): void {
    if (url.pathname === "/install-extension") {
      // .query is e.g.  {"@mirantis/lens-extension-cc": ""}, convert it to "@mirantis/lens-extension-cc"
      const packageName = Object.keys(url.query)[0];

      console.log(`Installing ${packageName} from lens:// url`);

      // TODO: Open extensions page
    } else {
      throw new RoutingError(RoutingErrorType.INVALID_PATHNAME, url);
    }
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
    if (!this.extentionRoutes.has(id)) {
      this.extentionRoutes.set(id, new Map());
    }

    if (urlSchema.includes(`:${EXT_ID_MATCH}`)) {
      throw new TypeError("Invalid url path schema");
    }

    this.extentionRoutes.get(id).set(urlSchema, handler);
  }
}
