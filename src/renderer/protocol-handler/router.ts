import { ipcRenderer } from "electron";
import * as proto from "../../common/protocol-handler";
import logger from "../../main/logger";
export class LensProtocolRouterRenderer extends proto.LensProtocolRouter {
  /**
   * This function is needed to be called early on in the renderers lifetime.
   */
  public init(): void {
    ipcRenderer
      .on(proto.ProtocolHandlerInternal, this.ipcInternalHandler)
      .on(proto.ProtocolHandlerExtension, this.ipcExtensionHandler);
  }

  private ipcInternalHandler(event: Electron.IpcRendererEvent, ...args: any[]): void {
    if (args.length !== 1) {
      return void logger.warn(`${proto.LensProtocolRouter.LoggingPrefix}: unexpected number of args`, { args });
    }

    console.log(args[0]);
  }

  private ipcExtensionHandler(event: Electron.IpcRendererEvent, ...args: any[]): void {
    if (args.length !== 1) {
      return void logger.warn(`${proto.LensProtocolRouter.LoggingPrefix}: unexpected number of args`, { args });
    }

    console.log(args[0]);
  }
}
