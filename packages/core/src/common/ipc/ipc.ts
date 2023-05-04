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
import { isArray } from "@k8slens/utilities";
import { getLegacyGlobalDiForExtensionApi } from "@k8slens/legacy-global-di";
import ipcRendererInjectable from "../../renderer/utils/channel/ipc-renderer.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import ipcMainInjectionToken from "./ipc-main-injection-token";
import clusterFramesInjectable from "../cluster-frames.injectable";

export const broadcastMainChannel = "ipc:broadcast-main";

export function ipcMainHandle(channel: string, listener: (event: Electron.IpcMainInvokeEvent, ...args: unknown[]) => unknown) {
  const di = getLegacyGlobalDiForExtensionApi();

  const ipcMain = di.inject(ipcMainInjectionToken);

  ipcMain.handle(channel, async (event, ...args: unknown[]) => {
    return toJS(await listener(event, ...args));
  });
}

export async function broadcastMessage(channel: string, ...args: unknown[]): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (ipcRenderer) {
    await ipcRenderer.invoke(broadcastMainChannel, channel, ...args.map(toJS));

    return;
  }

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!webContents) {
    return;
  }

  const di = getLegacyGlobalDiForExtensionApi();
  const logger = di.inject(loggerInjectionToken);
  const clusterFrames = di.inject(clusterFramesInjectable);

  ipcMain.listeners(channel).forEach((func) => {
    func(
      {
        processId: undefined,
        frameId: undefined,
        sender: undefined,
        senderFrame: undefined,
      },
      ...args,
    );
  });

  const views = webContents.getAllWebContents() ?? [];

  if (!isArray(views) || views.length === 0) return;

  args = args.map(toJS);

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

export function ipcMainOn(channel: string, listener: (event: Electron.IpcMainEvent, ...args: unknown[]) => unknown): Disposer {
  const di = getLegacyGlobalDiForExtensionApi();

  const ipcMain = di.inject(ipcMainInjectionToken);

  ipcMain.on(channel, listener);

  return () => ipcMain.off(channel, listener);
}

export function ipcRendererOn(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => unknown): Disposer {
  const di = getLegacyGlobalDiForExtensionApi();

  const ipcRenderer = di.inject(ipcRendererInjectable);

  ipcRenderer.on(channel, listener);

  return () => ipcRenderer.off(channel, listener);
}
