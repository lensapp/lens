// Inter-process communications (main <-> renderer)
// https://www.electronjs.org/docs/api/ipc-main
// https://www.electronjs.org/docs/api/ipc-renderer

import { ipcMain, ipcRenderer, webContents, remote } from "electron";
import { toJS } from "mobx";
import logger from "../../main/logger";
import { ClusterFrameInfo, clusterFrameMap } from "../cluster-frames";

const subFramesChannel = "ipc:get-sub-frames";

export function handleRequest(channel: string, listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any) {
  ipcMain.handle(channel, listener);
}

export async function requestMain(channel: string, ...args: any[]) {
  return ipcRenderer.invoke(channel, ...args);
}

function getSubFrames(): ClusterFrameInfo[] {
  return toJS(Array.from(clusterFrameMap.values()), { recurseEverything: true });
}

export async function broadcastMessage(channel: string, ...args: any[]) {
  const views = (webContents || remote?.webContents)?.getAllWebContents();

  if (!views) return;

  if (ipcRenderer) {
    ipcRenderer.send(channel, ...args);
  } else {
    ipcMain.emit(channel, ...args);
  }

  for (const view of views) {
    const type = view.getType();

    logger.silly(`[IPC]: broadcasting "${channel}" to ${type}=${view.id}`, { args });
    view.send(channel, ...args);

    try {
      const subFrames: ClusterFrameInfo[] = ipcRenderer
        ? await requestMain(subFramesChannel)
        : getSubFrames();

      for (const frameInfo of subFrames) {
        view.sendToFrame([frameInfo.processId, frameInfo.frameId], channel, ...args);
      }
    } catch (error) {
      logger.error("[IPC]: failed to send IPC message", { error: String(error) });
    }
  }
}

export function subscribeToBroadcast(channel: string, listener: (...args: any[]) => any) {
  if (ipcRenderer) {
    ipcRenderer.on(channel, listener);
  } else {
    ipcMain.on(channel, listener);
  }

  return listener;
}

export function unsubscribeFromBroadcast(channel: string, listener: (...args: any[]) => any) {
  if (ipcRenderer) {
    ipcRenderer.off(channel, listener);
  } else {
    ipcMain.off(channel, listener);
  }
}

export function unsubscribeAllFromBroadcast(channel: string) {
  if (ipcRenderer) {
    ipcRenderer.removeAllListeners(channel);
  } else {
    ipcMain.removeAllListeners(channel);
  }
}

export function bindBroadcastHandlers() {
  handleRequest(subFramesChannel, () => {
    return getSubFrames();
  });
}
