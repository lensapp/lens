import Url from "url-parse";
import { match, matchPath } from "react-router";
import { pathToRegexp } from "path-to-regexp";
import logger from "../logger";
import { countBy } from "lodash";
import * as proto from "../../common/protocol-handler";
import { LensExtensionId } from "../../extensions/lens-extension";
import { ipcMain } from "electron";
import { WindowManager } from "../window-manager";
import { extensionsStore } from "../../extensions/extensions-store";

const EXTENSION_PUBLISHER_MATCH = "LENS_INTERNAL_EXTENSION_PUBLISHER_MATCH";
const EXTENSION_NAME_MATCH = "LENS_INTERNAL_EXTENSION_NAME_MATCH";

// IPC channel for protocol actions. Main broadcasts the open-url events to this channel.
export const lensProtocolChannel = "protocol-handler";

interface ExtensionUrlMatch {
  [EXTENSION_PUBLISHER_MATCH]: string;
  [EXTENSION_NAME_MATCH]: string;
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

/**
 * Generate a new function that sends an IPC message to the renderer on the given channel
 * @param channel the IPC channel to send the notification back to the renderer
 */
function produceNotifyRenderer(handlerId: string): proto.RouteHandler {
  return function (params: proto.RouteParams): void {
    WindowManager.getInstance<WindowManager>().sendToView({
      channel: proto.ProtocolHandlerBackChannel,
      data: [handlerId, params],
    });
  };
}

/**
 *
 * @param event data about the source of the IPC event
 * @param ipcArgs the deserialized arguments passed to the IPC send method
 */
function registerIpcHandler(event: Electron.IpcMainEvent, ...ipcArgs: unknown[]): void {
  const [args] = ipcArgs;

  if(!proto.validateRegisterParams(args)) {
    return void logger.warn(`${proto.LensProtocolRouter.LoggingPrefix}: ipc call to "${proto.ProtocolHandlerRegister}" invalid arguments`, { ipcArgs });
  }

  const lprm = LensProtocolRouterMain.getInstance<LensProtocolRouterMain>();

  switch (args.handlerType) {
    case proto.HandlerType.INTERNAL:
      return lprm.on(args.pathSchema, produceNotifyRenderer(args.handlerId));
    case proto.HandlerType.EXTENSION:
      return lprm.extensionOn(args.extensionName, args.pathSchema, produceNotifyRenderer(args.handlerId));
  }
}

function deregisterIpcHandler(event: Electron.IpcMainEvent, ...ipcArgs: unknown[]): void {
  const [args] = ipcArgs;

  if(!proto.validateDeregisterParams(args)) {
    return void logger.warn(`${proto.LensProtocolRouter.LoggingPrefix}: ipc call to "${proto.ProtocolHandlerDeregister}" invalid arguments`, { ipcArgs });
  }

  LensProtocolRouterMain.getInstance<LensProtocolRouterMain>().removeExtensionHandlers(args.extensionName);
}

export class LensProtocolRouterMain extends proto.LensProtocolRouter {
  private extentionRoutes = new Map<LensExtensionId, Map<string, proto.RouteHandler>>();
  private internalRoutes = new Map<string, proto.RouteHandler>();
  private missingExtensionHandlers: proto.FallbackHandler[] = [];

  private static readonly ExtensionUrlSchema = `/:${EXTENSION_PUBLISHER_MATCH}(\@[A-Za-z0-9_]+)?/:${EXTENSION_NAME_MATCH}`;

  /**
   * route the given URL to
   */
  public async route(url: Url): Promise<void> {
    if (url.protocol.toLowerCase() !== "lens:") {
      throw new proto.RoutingError(proto.RoutingErrorType.INVALID_PROTOCOL, url);
    }

    switch (url.host) {
      case "internal":
        return this._route(this.internalRoutes, url);
      case "extension":
        return this._routeToExtension(url);
      default:
        throw new proto.RoutingError(proto.RoutingErrorType.INVALID_HOST, url);

    }
  }

  public registerIpcHandlers(): void {
    ipcMain
      .on(proto.ProtocolHandlerRegister, registerIpcHandler)
      .on(proto.ProtocolHandlerDeregister, deregisterIpcHandler);
  }

  private async _routeToExtension(url: Url) {
    const match = matchPath<ExtensionUrlMatch>(url.pathname, LensProtocolRouterMain.ExtensionUrlSchema);

    if (!match) {
      throw new proto.RoutingError(proto.RoutingErrorType.NO_EXTENSION_ID, url);
    }

    const { [EXTENSION_PUBLISHER_MATCH]: publisher, [EXTENSION_NAME_MATCH]: partialName } = match.params;
    const name = [publisher, partialName].filter(Boolean).join("/");

    logger.info(`${proto.LensProtocolRouter.LoggingPrefix}: Extension ${name} matched`);

    let routes = this.extentionRoutes.get(name);

    if (!routes || !extensionsStore.isEnabledByName(name)) {
      if (this.missingExtensionHandlers.length === 0) {
        throw new proto.RoutingError(proto.RoutingErrorType.MISSING_EXTENSION, url);
      }

      foundMissingHandler: {
        for (const missingExtensionHandler of this.missingExtensionHandlers) {
          if (await missingExtensionHandler(name)) {
            break foundMissingHandler;
          }
        }

        // if none of the handlers resolved to `true` then we have finished the loop
        return;
      }

      routes = this.extentionRoutes.get(name);

      if (!routes) {
        logger.info(`${proto.LensProtocolRouter.LoggingPrefix}: Extension ${name} matched, but has no routes`);

        return;
      }
    }

    this._route(routes, url, true);
  }

  private _route(routes: Map<string, proto.RouteHandler>, url: Url, matchExtension = false): void {
    const matches = Array.from(routes.entries())
      .map(([schema, handler]): [match<Record<string, string>>, proto.RouteHandler] => {
        if (matchExtension) {
          schema = `${LensProtocolRouterMain.ExtensionUrlSchema}/${schema}`.replace(/\/?\//g, "/");
        }

        return [matchPath(url.pathname, { path: schema }), handler];
      })
      .filter(([match]) => match);
    // prefer an exact match, but if not pick the first route registered
    const route = matches.find(([match]) => match.isExact)
      ?? matches.sort(([a], [b]) => compareMatches(a, b))[0];

    if (!route) {
      throw new proto.RoutingError(proto.RoutingErrorType.NO_HANDLER, url);
    }

    logger.info(`${proto.LensProtocolRouter.LoggingPrefix}: routing ${url.toString()}`);

    const [match, handler] = route;

    delete match.params[EXTENSION_NAME_MATCH];
    delete match.params[EXTENSION_PUBLISHER_MATCH];
    handler({
      pathname: match.params,
      search: url.query,
    });
  }

  public on(urlSchema: string, handler: proto.RouteHandler): void {
    pathToRegexp(urlSchema); // verify now that the schema is valid
    logger.info(`${proto.LensProtocolRouter.LoggingPrefix}: internal registering ${urlSchema}`);
    this.internalRoutes.set(urlSchema, handler);
  }

  public extensionOn(id: LensExtensionId, urlSchema: string, handler: proto.RouteHandler): void {
    logger.info(`${proto.LensProtocolRouter.LoggingPrefix}: extension ${id} registering ${urlSchema}`);
    pathToRegexp(urlSchema); // verify now that the schema is valid

    if (!this.extentionRoutes.has(id)) {
      this.extentionRoutes.set(id, new Map());
    }

    if (urlSchema.includes(`:${EXTENSION_NAME_MATCH}`) || urlSchema.includes(`:${EXTENSION_PUBLISHER_MATCH}`)) {
      throw new TypeError("Invalid url path schema");
    }

    this.extentionRoutes.get(id).set(urlSchema, handler);
  }

  public removeExtensionHandlers(id: LensExtensionId): void {
    this.extentionRoutes.delete(id);
  }

  /**
   * onMissingExtension registers a handler for when an extension is missing.
   * These will be called in the order registered until one of them results in
   * `true`.
   * @param handler If the called handler resolves to true then the routes will be tried again
   */
  public onMissingExtension(handler: proto.FallbackHandler): void {
    this.missingExtensionHandlers.push(handler);
  }
}
