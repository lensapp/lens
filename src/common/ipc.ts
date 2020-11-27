// Inter-process communications (main <-> renderer)
// https://www.electronjs.org/docs/api/ipc-main
// https://www.electronjs.org/docs/api/ipc-renderer

import { ipcMain, ipcRenderer, webContents, remote } from "electron";
import logger from "../main/logger";
import { clusterFrameMap } from "./cluster-frames";

export function handleRequest(channel: string, listener: (...args: any[]) => any) {
  ipcMain.handle(channel, listener);
}

export async function requestMain(channel: string, ...args: any[]) {
  return ipcRenderer.invoke(channel, ...args);
}

async function getSubFrames(): Promise<number[]> {
  const subFrames: number[] = [];
  clusterFrameMap.forEach(frameId => {
    subFrames.push(frameId);
  });
  return subFrames;
}

export function broadcastMessage(channel: string, ...args: any[]) {
  const views = (webContents || remote?.webContents)?.getAllWebContents();
  if (!views) return;

  views.forEach(webContent => {
    const type = webContent.getType();
    logger.silly(`[IPC]: broadcasting "${channel}" to ${type}=${webContent.id}`, { args });
    webContent.send(channel, ...args);
    getSubFrames().then((frames) => {
      frames.map((frameId) => {
        webContent.sendToFrame(frameId, channel, ...args);
      });
    }).catch((e) => e);
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
