// Inter-process communications (main <-> renderer)
// https://www.electronjs.org/docs/api/ipc-main
// https://www.electronjs.org/docs/api/ipc-renderer

import { ipcMain, ipcRenderer, webContents, remote } from "electron";
import { toJS } from "mobx";
import { EventEmitter } from "ws";
import logger from "../../main/logger";
import { ClusterFrameInfo, clusterFrameMap } from "../cluster-frames";

const subFramesChannel = "ipc:get-sub-frames";

export type HandlerEvent<EM extends EventEmitter> = Parameters<Parameters<EM["on"]>[1]>[0];
export type EventListener<E extends EventEmitter, T extends any[]> = (event: HandlerEvent<E>, ...args: T) => any;

export function handleRequest(channel: string, listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any) {
  ipcMain.handle(channel, listener);
}

export async function requestMain(channel: string, ...args: any[]) {
  return ipcRenderer.invoke(channel, ...args);
}

/**
 * Adds a listener to `source` that waits for the first IPC message with the correct
 * argument data is sent.
 * @param channel The channel to be listened on
 * @param listener The function for the channel to be called if the args of the correct type
 * @param verifier The function to be called to verify that the args are the correct type
 */
export function onceCorrect<
  EM extends EventEmitter,
  T extends any[],
  L extends (event: HandlerEvent<EM>, ...args: T) => any
>(
  source: EM,
  channel: string | symbol,
  listener: L,
  verifier: (args: unknown[]) => args is T
): void {
  function handler(event: HandlerEvent<EM>, ...args: unknown[]): void {
    if (verifier(args)) {
      source.removeListener(channel, handler); // remove immediately

      Promise.resolve(listener(event, ...args)) // might return a promise
        .catch(error => logger.error("[IPC]: channel once handler threw error", { channel, error }));
    } else {
      logger.error("[IPC]: channel was sent to with invalid data", { channel, args });
    }
  }

  source.on(channel, handler);
}

/**
 * Adds a listener to `source` that checks to verify the arguments before calling the handler.
 * @param channel The channel to be listened on
 * @param listener The function for the channel to be called if the args of the correct type
 * @param verifier The function to be called to verify that the args are the correct type
 */
export function onCorrect<
  EM extends EventEmitter,
  T extends any[],
  L extends (event: HandlerEvent<EM>, ...args: T) => any
>(
  source: EM,
  channel: string | symbol,
  listener: L,
  verifier: (args: unknown[]) => args is T
): void {
  source.on(channel, (event, ...args: unknown[]) => {
    if (verifier(args)) {
      Promise.resolve(listener(event, ...args)) // might return a promise
        .catch(error => logger.error("[IPC]: channel on handler threw error", { channel, error }));
    } else {
      logger.error("[IPC]: channel was sent to with invalid data", { channel, args });
    }
  });
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
      logger.error("[IPC]: failed to send IPC message", { error });
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
