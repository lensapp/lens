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

// Inter-process communications (main <-> renderer)
// https://www.electronjs.org/docs/api/ipc-main
// https://www.electronjs.org/docs/api/ipc-renderer

import { ipcMain, ipcRenderer, remote, webContents } from "electron";
import { toJS } from "../utils/toJS";
import logger from "../../main/logger";
import { ClusterFrameInfo, clusterFrameMap } from "../cluster-frames";
import type { Disposer } from "../utils";

const subFramesChannel = "ipc:get-sub-frames";

export async function requestMain(channel: string, ...args: any[]) {
  return ipcRenderer.invoke(channel, ...args.map(sanitizePayload));
}

export function ipcMainHandle(channel: string, listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any) {
  ipcMain.handle(channel, async (event, ...args) => {
    return sanitizePayload(await listener(event, ...args));
  });
}

function getSubFrames(): ClusterFrameInfo[] {
  return Array.from(clusterFrameMap.values());
}

export function broadcastMessage(channel: string, ...args: any[]) {
  const views = (webContents || remote?.webContents)?.getAllWebContents();

  if (!views) return;
  args = args.map(sanitizePayload);

  ipcRenderer?.send(channel, ...args);
  ipcMain?.emit(channel, ...args);

  const subFramesP = ipcRenderer
    ? requestMain(subFramesChannel)
    : Promise.resolve(getSubFrames());

  subFramesP
    .then(subFrames => {
      for (const view of views) {
        try {
          logger.silly(`[IPC]: broadcasting "${channel}" to ${view.getType()}=${view.id}`, { args });
          view.send(channel, ...args);

          for (const frameInfo of subFrames) {
            view.sendToFrame([frameInfo.processId, frameInfo.frameId], channel, ...args);
          }
        } catch (error) {
          logger.error("[IPC]: failed to send IPC message", { error: String(error) });
        }
      }
    });
}

export function ipcMainOn(channel: string, listener: (event: Electron.IpcMainEvent, ...args: any[]) => any): Disposer {
  ipcMain.on(channel, listener);

  return () => ipcMain.off(channel, listener);
}

export function ipcRendererOn(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => any): Disposer {
  ipcRenderer.on(channel, listener);

  return () => ipcRenderer.off(channel, listener);
}

export function bindBroadcastHandlers() {
  ipcMainHandle(subFramesChannel, () => getSubFrames());
}

/**
 * Sanitizing data for IPC-messaging before send.
 * Removes possible observable values to avoid exceptions like "can't clone object".
 */
function sanitizePayload<T>(data: any): T {
  return toJS(data);
}
