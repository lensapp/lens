/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { ipcRenderer } from "electron";
import { IpcPrefix, IpcRegistrar } from "./ipc-registrar";
import { Disposers } from "../lens-extension";
import type { LensRendererExtension } from "../lens-renderer-extension";
import type { Disposer } from "@k8slens/utilities";
import { once } from "lodash";

export abstract class IpcRenderer extends IpcRegistrar {
  constructor(extension: LensRendererExtension) {
    super(extension);

    // Call the static method on the bottom child class.
    extension[Disposers].push(() => (this.constructor as typeof IpcRenderer).resetInstance());
  }

  /**
   * Listen for broadcasts within your extension.
   * If the lifetime of the listener should be tied to the mounted lifetime of
   * a component then putting the returned value in a `disposeOnUnmount` call will suffice.
   * @param channel The channel to listen for broadcasts on
   * @param listener The function that will be called with the arguments of the broadcast
   * @returns An optional disposer, Lens will cleanup even if this is not called
   */
  listen(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => any): Disposer {
    const prefixedChannel = `extensions@${this[IpcPrefix]}:${channel}`;
    const cleanup = once(() => {
      console.debug(`[IPC-RENDERER]: removing extension listener`, { channel, extension: { name: this.extension.name, version: this.extension.version }});

      return ipcRenderer.removeListener(prefixedChannel, listener);
    });

    console.debug(`[IPC-RENDERER]: adding extension listener`, { channel, extension: { name: this.extension.name, version: this.extension.version }});
    ipcRenderer.addListener(prefixedChannel, listener);
    this.extension[Disposers].push(cleanup);

    return cleanup;
  }

  /**
   * Request main to execute its function over the `channel` channel.
   * This function only interacts with functions registered via `Ipc.IpcMain.handleRpc`
   * An error will be thrown if no function has been registered on `main` with this channel ID.
   * @param channel The channel to invoke a RPC on
   * @param args The arguments to pass to the RPC
   * @returns A promise of the resulting value
   */
  invoke(channel: string, ...args: any[]): Promise<any> {
    const prefixedChannel = `extensions@${this[IpcPrefix]}:${channel}`;

    return ipcRenderer.invoke(prefixedChannel, ...args);
  }
}
