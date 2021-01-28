// Inter-process communications (main <-> renderer)
// https://www.electronjs.org/docs/api/ipc-main
// https://www.electronjs.org/docs/api/ipc-renderer

import { ipcMain, ipcRenderer, webContents, remote } from "electron";
import { toJS } from "mobx";
import logger from "../main/logger";
import { ClusterFrameInfo, clusterFrameMap } from "./cluster-frames";

const subFramesChannel = "ipc:get-sub-frames";

export function handleRequest(channel: string, listener: (...args: any[]) => any) {
  ipcMain.handle(channel, listener);
}

export async function requestMain(channel: string, ...args: any[]) {
  return ipcRenderer.invoke(channel, ...args);
}

async function getSubFrames(): Promise<ClusterFrameInfo[]> {
  return Array.from(clusterFrameMap.values());
}

export async function broadcastMessage(channel: string, ...args: any[]) {
  const views = (webContents || remote?.webContents)?.getAllWebContents();

  if (!views) return;

  const subFrames: Promise<ClusterFrameInfo[]> = ipcRenderer
    ? requestMain(subFramesChannel)
    : getSubFrames();

  views.forEach(async webContent => {
    const type = webContent.getType();

    logger.silly(`[IPC]: broadcasting "${channel}" to ${type}=${webContent.id}`, { args });
    webContent.send(channel, ...args);
    subFrames.then((frames) => {
      frames.map((frameInfo) => {
        webContent.sendToFrame([frameInfo.processId, frameInfo.frameId], channel, ...args);
      });
    }).catch((e) => {
      logger.warning(`[IPC]: failed to broadcast ${channel} to frame`, { error: e});
    });
  });

  if (ipcRenderer) {
    ipcRenderer.send(channel, ...args);
  } else {
    ipcMain.emit(channel, ...args);
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
  handleRequest(subFramesChannel, async () => {
    return toJS(await getSubFrames(), { recurseEverything: true });
  });
}
