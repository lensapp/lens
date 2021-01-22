// Inter-process communications (main <-> renderer)
// https://www.electronjs.org/docs/api/ipc-main
// https://www.electronjs.org/docs/api/ipc-renderer

import { ipcMain, ipcRenderer, webContents, remote } from "electron";
import { toJS } from "mobx";
import logger from "../main/logger";
import { ClusterFrameInfo, clusterFrameMap } from "./cluster-frames";

export function handleRequest(channel: string, listener: (...args: any[]) => any) {
  ipcMain.handle(channel, listener);
}

export async function requestMain(channel: string, ...args: any[]) {
  return ipcRenderer.invoke(channel, ...args);
}

async function getSubFrames(): Promise<ClusterFrameInfo[]> {
  const subFrames: ClusterFrameInfo[] = [];

  clusterFrameMap.forEach(frameInfo => {
    subFrames.push(frameInfo);
  });

  return subFrames;
}

export async function broadcastMessage(channel: string, ...args: any[]) {
  let subFrames: ClusterFrameInfo[];

  if (ipcRenderer) {
    subFrames = await requestMain("ipc:get-sub-frames");
  } else {
    subFrames = await getSubFrames();
  }
  const views = (webContents || remote.webContents)?.getAllWebContents();

  if (!views) return;

  views.forEach(webContent => {
    const type = webContent.getType();

    logger.silly(`[IPC]: broadcasting "${channel}" to ${type}=${webContent.id}`, { args });
    webContent.send(channel, ...args);
    subFrames.map((frameInfo) => {
      webContent.sendToFrame([frameInfo.processId, frameInfo.frameId], channel, ...args);
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
  handleRequest("ipc:get-sub-frames", async () => {
    return toJS(await getSubFrames(), { recurseEverything: true });
  });
}
