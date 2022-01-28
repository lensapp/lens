/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Inter-process communications (main <-> renderer)
// https://www.electronjs.org/docs/api/ipc-main
// https://www.electronjs.org/docs/api/ipc-renderer

import { ipcMain, ipcRenderer, webContents } from "electron";
import { toJS } from "../utils/toJS";
import logger from "../../main/logger";
import { ClusterFrameInfo, clusterFrameMap } from "../cluster-frames";
import type { Disposer } from "../utils";
import type remote from "@electron/remote";

const electronRemote = (() => {
  if (ipcRenderer) {
    try {
      return require("@electron/remote");
    } catch {
      // ignore temp
    }
  }

  return null;
})();

const subFramesChannel = "ipc:get-sub-frames";

export function requestMain(channel: string, ...args: any[]) {
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
  const subFramesP = ipcRenderer
    ? requestMain(subFramesChannel)
    : Promise.resolve(getSubFrames());

  subFramesP
    .then(subFrames => {
      const views: undefined | ReturnType<typeof webContents.getAllWebContents> | ReturnType<typeof remote.webContents.getAllWebContents> = (webContents || electronRemote?.webContents)?.getAllWebContents();

      if (!views || !Array.isArray(views) || views.length === 0) return;
      args = args.map(sanitizePayload);

      ipcRenderer?.send(channel, ...args);
      ipcMain?.emit(channel, ...args);

      for (const view of views) {
        let viewType = "unknown";

        // There will be a uncaught exception if the view is destroyed.
        try {
          viewType = view.getType();
        } catch {
          // We can ignore the view destroyed exception as viewType is only used for logging.
        }

        // Send message to views.
        try {
          logger.silly(`[IPC]: broadcasting "${channel}" to ${viewType}=${view.id}`, { args });
          view.send(channel, ...args);
        } catch (error) {
          logger.error(`[IPC]: failed to send IPC message "${channel}" to view "${viewType}=${view.id}"`, { error: String(error) });
        }

        // Send message to subFrames of views.
        for (const frameInfo of subFrames) {
          logger.silly(`[IPC]: broadcasting "${channel}" to subframe "frameInfo.processId"=${frameInfo.processId} "frameInfo.frameId"=${frameInfo.frameId}`, { args });

          try {
            view.sendToFrame([frameInfo.processId, frameInfo.frameId], channel, ...args);
          } catch (error) {
            logger.error(`[IPC]: failed to send IPC message "${channel}" to view "${viewType}=${view.id}"'s subframe "frameInfo.processId"=${frameInfo.processId} "frameInfo.frameId"=${frameInfo.frameId}`, { error: String(error) });
          }
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
