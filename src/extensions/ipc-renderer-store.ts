import { ipcRenderer } from "electron";
import { IpcPrefix, IpcStore } from "./ipc-store";
import { Disposers } from "./lens-extension";
import { LensRendererExtension } from "./lens-renderer-extension";

export class RendererIpcStore extends IpcStore {
  constructor(extension: LensRendererExtension) {
    super(extension);
    extension[Disposers].push(() => RendererIpcStore.resetInstance());
  }

  listenIpc(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => any): void {
    const prefixedChannel = `extensions@${this[IpcPrefix]}:${channel}`;

    ipcRenderer.addListener(prefixedChannel, listener);
    this.extension[Disposers].push(() => ipcRenderer.removeListener(prefixedChannel, listener));
  }

  invokeIpc(channel: string, ...args: any[]): Promise<any> {
    const prefixedChannel = `extensions@${this[IpcPrefix]}:${channel}`;

    return ipcRenderer.invoke(prefixedChannel, ...args);
  }
}
