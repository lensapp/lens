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
