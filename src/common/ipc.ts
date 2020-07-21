// Inter-protocol communications (main <-> renderer)
// https://www.electronjs.org/docs/api/ipc-main
// https://www.electronjs.org/docs/api/ipc-renderer

import { ipcMain, ipcRenderer, WebContents, webContents } from "electron"
import logger from "../main/logger";

export type IpcChannel = string;

export interface IpcHandleOpts {
  timeout?: number;
}

export interface IpcMessageHandler<T extends any[] = any> {
  (...args: T): any;
}

export interface IpcMessageOpts<A extends any[] = any> {
  channel: IpcChannel
  webContentId?: number; // sends to single webContents view
  filter?: (webContent: WebContents) => boolean
  timeout?: number; // todo: add support
  args?: A;
}

export function broadcastIpc({ channel, webContentId, filter, args = [] }: IpcMessageOpts) {
  const singleView = webContentId ? webContents.fromId(webContentId) : null;
  let views = singleView ? [singleView] : webContents.getAllWebContents();
  if (filter) {
    views = views.filter(filter);
  }
  views.forEach(webContent => {
    const type = webContent.getType();
    logger.debug(`[IPC]: sending message "${channel}" to ${type}=${webContent.id}`, { args });
    webContent.send(channel, ...[args].flat());
  })
}

// todo: support timeout + merge with sendMessage?
export async function invokeIpc<R = any>(channel: IpcChannel, ...args: any[]): Promise<R> {
  logger.info(`[IPC]: invoke channel "${channel}"`, { args });
  return ipcRenderer.invoke(channel, ...args);
}

// todo: make isomorphic api
export function handleIpc<T extends any[]>(channel: IpcChannel, handler: IpcMessageHandler<T>, options: IpcHandleOpts = {}) {
  const { timeout = 0 } = options;
  ipcMain.handle(channel, async (event, ...args: T) => {
    logger.info(`[IPC]: handle "${channel}"`, { args });
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
        resolve(result);
        clearTimeout(timerId);
      } catch (err) {
        reject(err);
      }
    })
  })
}
