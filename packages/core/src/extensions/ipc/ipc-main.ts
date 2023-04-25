/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { ipcMain } from "electron";
import { IpcPrefix, IpcRegistrar } from "./ipc-registrar";
import { Disposers } from "../lens-extension";
import type { LensMainExtension } from "../lens-main-extension";
import type { Disposer } from "@k8slens/utilities";
import { once } from "lodash";
import { ipcMainHandle } from "../../common/ipc";
import type { Logger } from "../common-api";
import { getEnvironmentSpecificLegacyGlobalDiForExtensionApi } from "@k8slens/legacy-global-di";
import loggerInjectable from "../../common/logger.injectable";

interface Dependencies {
  readonly logger: Logger;
}

export abstract class IpcMain extends IpcRegistrar {
  private readonly dependencies: Dependencies;

  constructor(extension: LensMainExtension) {
    super(extension);

    const di = getEnvironmentSpecificLegacyGlobalDiForExtensionApi("main");

    this.dependencies = {
      logger: di.inject(loggerInjectable),
    };

    // Call the static method on the bottom child class.
    extension[Disposers].push(() => (this.constructor as typeof IpcMain).resetInstance());
  }

  /**
   * Listen for broadcasts within your extension
   * @param channel The channel to listen for broadcasts on
   * @param listener The function that will be called with the arguments of the broadcast
   * @returns An optional disposer, Lens will cleanup when the extension is disabled or uninstalled even if this is not called
   */
  listen(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => any): Disposer {
    const prefixedChannel = `extensions@${this[IpcPrefix]}:${channel}`;
    const cleanup = once(() => {
      this.dependencies.logger.debug(`[IPC-RENDERER]: removing extension listener`, { channel, extension: { name: this.extension.name, version: this.extension.version }});

      return ipcMain.removeListener(prefixedChannel, listener);
    });

    this.dependencies.logger.debug(`[IPC-RENDERER]: adding extension listener`, { channel, extension: { name: this.extension.name, version: this.extension.version }});
    ipcMain.addListener(prefixedChannel, listener);
    this.extension[Disposers].push(cleanup);

    return cleanup;
  }

  /**
   * Declare a RPC over `channel`. Lens will cleanup when the extension is disabled or uninstalled
   * @param channel The name of the RPC
   * @param handler The remote procedure that is called
   */
  handle(channel: string, handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any): void {
    const prefixedChannel = `extensions@${this[IpcPrefix]}:${channel}`;

    this.dependencies.logger.debug(`[IPC-RENDERER]: adding extension handler`, { channel, extension: { name: this.extension.name, version: this.extension.version }});
    ipcMainHandle(prefixedChannel, handler);
    this.extension[Disposers].push(() => {
      this.dependencies.logger.debug(`[IPC-RENDERER]: removing extension handler`, { channel, extension: { name: this.extension.name, version: this.extension.version }});

      return ipcMain.removeHandler(prefixedChannel);
    });
  }
}
