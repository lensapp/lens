// Inter-protocol communications (main <-> renderer)
// https://www.electronjs.org/docs/api/ipc-main
// https://www.electronjs.org/docs/api/ipc-renderer

import { ipcMain, ipcRenderer, webContents } from "electron"
import logger from "../main/logger";

export type IpcChannel = string;

export interface IpcMessageOptions {
  timeout?: number;
}

export interface IpcMessageHandler {
  (...args: any[]): any;
}

export function sendMessage(channel: IpcChannel, ...args: any[]) {
  const webContent = webContents.getFocusedWebContents();
  if (webContent) {
    webContent.send(channel, ...args);
  }
}

export async function invokeMessage(channel: IpcChannel, ...args: any[]) {
  logger.debug(`[IPC]: invoke channel "${channel}"`, { args });
  return ipcRenderer.invoke(channel, ...args);
}

export function handleMessage(channel: IpcChannel, handler: IpcMessageHandler, options: IpcMessageOptions = {}) {
  const { timeout = 0 } = options;
  ipcMain.handle(channel, async (event, ...args: any[]) => {
    logger.debug(`[IPC]: handle "${channel}"`, { event, args });
    return new Promise(async (resolve, reject) => {
      let timerId;
      if (timeout) {
        timerId = setTimeout(() => {
          const timeoutError = new Error("[IPC]: response timeout");
          reject(timeoutError);
        }, timeout);
      }
      try {
        const result = await handler(...args); // todo: maybe exec in separate thread/worker
        clearTimeout(timerId);
        return result;
      } catch (err) {
        logger.debug(`[IPC]: handling "${channel}" error`, err);
      }
    })
  })
}

export function handleMessages(messages: Record<string, IpcMessageHandler>, options?: IpcMessageOptions) {
  Object.entries(messages).forEach(([channel, handler]) => {
    handleMessage(channel, handler, options);
  })
}
