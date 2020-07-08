// Inter-protocol communications (main <-> renderer)
// https://www.electronjs.org/docs/api/ipc-main
// https://www.electronjs.org/docs/api/ipc-renderer

import { ipcMain, ipcRenderer } from "electron"
import logger from "../main/logger";

export interface IpcOptions {
  timeout?: number;
}

export interface IpcMessageHandler {
  (...args: any[]): any;
}

export async function invokeMessage(channel: string, ...args: any[]) {
  logger.debug(`[IPC]: invoke channel "${channel}"`, { args });
  return ipcRenderer.invoke(channel, ...args);
}

export function onMessage(channel: string, handler: IpcMessageHandler, options: IpcOptions = {}) {
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

export function onMessages(messages: Record<string, IpcMessageHandler>, options?: IpcOptions) {
  Object.entries(messages).forEach(([channel, handler]) => {
    onMessage(channel, handler, options);
  })
}
