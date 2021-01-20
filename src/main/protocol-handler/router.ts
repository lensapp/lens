import logger from "../logger";
import * as proto from "../../common/protocol-handler";
import { WindowManager } from "../window-manager";
import Url from "url-parse";
import { LensExtension } from "../../extensions/lens-extension";

export interface FallbackHandler {
  (name: string): Promise<boolean>;
}

export class LensProtocolRouterMain extends proto.LensProtocolRouter {
  private missingExtensionHandlers: FallbackHandler[] = [];

  /**
   * Find the most specific registered handler, if it exists, and invoke it.
   *
   * This will send an IPC message to the renderer router to do the same
   * in the renderer.
   */
  public async route(rawUrl: string): Promise<void> {
    try {
      const url = new Url(rawUrl, true);

      if (url.protocol.toLowerCase() !== "lens:") {
        throw new proto.RoutingError(proto.RoutingErrorType.INVALID_PROTOCOL, url);
      }

      logger.info(`${proto.LensProtocolRouter.LoggingPrefix}: routing ${url.toString()}`);

      switch (url.host) {
        case "internal":
          return this._routeToInternal(url);
        case "extension":
          return this._routeToExtension(url);
        default:
          throw new proto.RoutingError(proto.RoutingErrorType.INVALID_HOST, url);
      }

    } catch (error) {
      if (error instanceof proto.RoutingError) {
        logger.error(`${proto.LensProtocolRouter.LoggingPrefix}: ${error}`, { url: error.url });
      } else {
        logger.error(`${proto.LensProtocolRouter.LoggingPrefix}: ${error}`, { rawUrl });
      }
    }
  }

  protected async _executeMissingExtensionHandlers(extensionName: string): Promise<boolean> {
    for (const handler of this.missingExtensionHandlers) {
      if (await handler(extensionName)) {
        return true;
      }
    }

    return false;
  }

  protected async _findMatchingExtensionByName(url: Url): Promise<LensExtension | string> {
    const firstAttempt = await super._findMatchingExtensionByName(url);

    if (typeof firstAttempt !== "string") {
      return firstAttempt;
    }

    if (await this._executeMissingExtensionHandlers(firstAttempt)) {
      return super._findMatchingExtensionByName(url);
    }

    return "";
  }

  protected _routeToInternal(url: Url): void {
    super._routeToExtension(url);

    WindowManager.getInstance<WindowManager>().sendToView({
      channel: proto.ProtocolHandlerInternal,
      data: [url],
    });
  }

  protected async _routeToExtension(url: Url): Promise<void> {
    // this needs to be done first, so that the missing extension handlers can
    // be called before notifying the renderer.
    await super._routeToExtension(url);

    WindowManager.getInstance<WindowManager>().sendToView({
      channel: proto.ProtocolHandlerExtension,
      data: [url],
    });
  }

  /**
   * Add a function to the list which will be sequentially called if an extension
   * is not found while routing to the extensions
   * @param handler A function that tries to find an extension
   */
  public addMissingExtensionHandler(handler: FallbackHandler): void {
    this.missingExtensionHandlers.push(handler);
  }
}
