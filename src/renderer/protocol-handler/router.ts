import { ipcRenderer } from "electron";
import * as proto from "../../common/protocol-handler";
import logger from "../../main/logger";
import Url from "url-parse";
import { autobind } from "../utils";

export class LensProtocolRouterRenderer extends proto.LensProtocolRouter {
  /**
   * This function is needed to be called early on in the renderers lifetime.
   */
  public init(): void {
    ipcRenderer
      .on(proto.ProtocolHandlerInternal, this.ipcInternalHandler)
      .on(proto.ProtocolHandlerExtension, this.ipcExtensionHandler);
  }

  @autobind()
  private ipcInternalHandler(event: Electron.IpcRendererEvent, ...args: any[]): void {
    if (args.length !== 1) {
      return void logger.warn(`${proto.LensProtocolRouter.LoggingPrefix}: unexpected number of args`, { args });
    }

    const [rawUrl] = args;
    const url = new Url(rawUrl, true);

    this._routeToInternal(url);
  }

  @autobind()
  private ipcExtensionHandler(event: Electron.IpcRendererEvent, ...args: any[]): void {
    if (args.length !== 1) {
      return void logger.warn(`${proto.LensProtocolRouter.LoggingPrefix}: unexpected number of args`, { args });
    }

    const [rawUrl] = args;
    const url = new Url(rawUrl, true);

    this._routeToExtension(url);
  }
}
