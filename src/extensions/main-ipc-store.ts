import { ipcMain } from "electron";
import { IpcPrefix, IpcStore } from "./ipc-store";
import { Disposers } from "./lens-extension";
import { LensMainExtension } from "./lens-main-extension";

export abstract class MainIpcStore extends IpcStore {
  constructor(extension: LensMainExtension) {
    super(extension);
    extension[Disposers].push(() => MainIpcStore.resetInstance());
  }

  handleIpc(channel: string, handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any): void {
    const prefixedChannel = `extensions@${this[IpcPrefix]}:${channel}`;

    ipcMain.handle(prefixedChannel, handler);
    this.extension[Disposers].push(() => ipcMain.removeHandler(prefixedChannel));
  }

  listenIpc(channel: string, listener: (event: Electron.IpcMainEvent, ...args: any[]) => any): void {
    const prefixedChannel = `extensions@${this[IpcPrefix]}:${channel}`;

    ipcMain.addListener(prefixedChannel, listener);
    this.extension[Disposers].push(() => ipcMain.removeListener(prefixedChannel, listener));
  }
}
