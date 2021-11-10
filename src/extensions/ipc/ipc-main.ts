/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { ipcMain } from "electron";
import { IpcPrefix, IpcRegistrar } from "./ipc-registrar";
import { Disposers } from "../lens-extension";
import type { LensMainExtension } from "../lens-main-extension";
import type { Disposer } from "../../common/utils";
import { once } from "lodash";
import { ipcMainHandle } from "../../common/ipc";
import logger from "../../common/logger";

export abstract class IpcMain extends IpcRegistrar {
  constructor(extension: LensMainExtension) {
    super(extension);

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
      logger.info(`[IPC-RENDERER]: removing extension listener`, { channel, extension: { name: this.extension.name, version: this.extension.version }});

      return ipcMain.removeListener(prefixedChannel, listener);
    });

    logger.info(`[IPC-RENDERER]: adding extension listener`, { channel, extension: { name: this.extension.name, version: this.extension.version }});
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

    logger.info(`[IPC-RENDERER]: adding extension handler`, { channel, extension: { name: this.extension.name, version: this.extension.version }});
    ipcMainHandle(prefixedChannel, handler);
    this.extension[Disposers].push(() => {
      logger.info(`[IPC-RENDERER]: removing extension handler`, { channel, extension: { name: this.extension.name, version: this.extension.version }});

      return ipcMain.removeHandler(prefixedChannel);
    });
  }
}
