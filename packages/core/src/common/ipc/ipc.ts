/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Inter-process communications (main <-> renderer)
// https://www.electronjs.org/docs/api/ipc-main
// https://www.electronjs.org/docs/api/ipc-renderer

import { ipcMain, ipcRenderer, webContents } from "electron";
import { toJS } from "../utils/toJS";
import type { Disposer } from "@k8slens/utilities";
import { getLegacyGlobalDiForExtensionApi } from "@k8slens/legacy-global-di";
import ipcRendererInjectable from "../../renderer/utils/channel/ipc-renderer.injectable";
import loggerInjectable from "../logger.injectable";
import ipcMainInjectionToken from "./ipc-main-injection-token";
import clusterFramesInjectable from "../cluster-frames.injectable";

export const broadcastMainChannel = "ipc:broadcast-main";

export function ipcMainHandle(channel: string, listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any) {
  const di = getLegacyGlobalDiForExtensionApi();

  const ipcMain = di.inject(ipcMainInjectionToken);

  ipcMain.handle(channel, async (event, ...args) => {
    return sanitizePayload(await listener(event, ...args));
  });
}

export async function broadcastMessage(channel: string, ...args: any[]): Promise<void> {
  if (ipcRenderer) {
    return ipcRenderer.invoke(broadcastMainChannel, channel, ...args.map(sanitizePayload));
  }

  if (!webContents) {
    return;
  }

  const di = getLegacyGlobalDiForExtensionApi();
  const logger = di.inject(loggerInjectable);
  const clusterFrames = di.inject(clusterFramesInjectable);

  ipcMain.listeners(channel).forEach((func) => func({
    processId: undefined, frameId: undefined, sender: undefined, senderFrame: undefined,
  }, ...args));

  const views = webContents.getAllWebContents();

  if (!views || !Array.isArray(views) || views.length === 0) return;

  args = args.map(sanitizePayload);

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
      logger.error(`[IPC]: failed to send IPC message "${channel}" to view "${viewType}=${view.id}"`, { error });
    }

    // Send message to subFrames of views.
    for (const frameInfo of clusterFrames.values()) {
      logger.silly(`[IPC]: broadcasting "${channel}" to subframe "frameInfo.processId"=${frameInfo.processId} "frameInfo.frameId"=${frameInfo.frameId}`, { args });

      try {
        view.sendToFrame([frameInfo.processId, frameInfo.frameId], channel, ...args);
      } catch (error) {
        logger.error(`[IPC]: failed to send IPC message "${channel}" to view "${viewType}=${view.id}"'s subframe "frameInfo.processId"=${frameInfo.processId} "frameInfo.frameId"=${frameInfo.frameId}`, { error: String(error) });
      }
    }
  }
}

export function ipcMainOn(channel: string, listener: (event: Electron.IpcMainEvent, ...args: any[]) => any): Disposer {
  const di = getLegacyGlobalDiForExtensionApi();

  const ipcMain = di.inject(ipcMainInjectionToken);

  ipcMain.on(channel, listener);

  return () => ipcMain.off(channel, listener);
}

export function ipcRendererOn(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => any): Disposer {
  const di = getLegacyGlobalDiForExtensionApi();

  const ipcRenderer = di.inject(ipcRendererInjectable);

  ipcRenderer.on(channel, listener);

  return () => ipcRenderer.off(channel, listener);
}

/**
 * Sanitizing data for IPC-messaging before send.
 * Removes possible observable values to avoid exceptions like "can't clone object".
 */
function sanitizePayload<T>(data: any): T {
  return toJS(data);
}
