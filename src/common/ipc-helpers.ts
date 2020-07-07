// Inter-protocol communications (main <-> renderer)
// https://www.electronjs.org/docs/api/ipc-main
// https://www.electronjs.org/docs/api/ipc-renderer

import { ipcMain, ipcRenderer } from "electron"
import logger from "../main/logger";

export interface IpcOptions {
  timeout?: number;
}

export async function sendMessage(channel: string, ...args: any[]) {
  logger.debug(`[IPC]: invoke "${channel}" with arguments`, args);
  return ipcRenderer.invoke(channel, ...args);
}

// todo: maybe spawn callback in separate thread/worker
export function onMessage<T = any>(channel: string, callback: (...args: any[]) => T, options: IpcOptions = {}) {
  const { timeout = 0 } = options;
  ipcMain.handle(channel, async (event, ...args: any[]) => {
    logger.debug(`[IPC]: handle "${channel}"`, event, args);
    return new Promise(async (resolve, reject) => {
      let timerId;
      if (timeout) {
        timerId = setTimeout(() => {
          const timeoutError = new Error("[IPC]: response timeout");
          reject(timeoutError);
        }, timeout);
      }
      try {
        const result = await callback(...args);
        clearTimeout(timerId);
        return result;
      } catch (err) {
        logger.debug(`[IPC]: handling "${channel}" error`, err);
      }
    })
  })
}
