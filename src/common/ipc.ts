// Inter-protocol communications (main <-> renderer)
// https://www.electronjs.org/docs/api/ipc-main
// https://www.electronjs.org/docs/api/ipc-renderer

import { ipcMain, ipcRenderer, WebContents, webContents } from "electron"
import logger from "../main/logger";

export type IpcChannel = string;

export interface IpcChannelOptions {
  channel: IpcChannel; // main <-> renderer communication channel name
  handle?: (...args: any[]) => Promise<any> | any; // message handler
  autoBind?: boolean; // auto-bind message handler in main-process, default: true
  timeout?: number; // timeout for waiting response from the sender
  once?: boolean; // one-time event
}

export function createIpcChannel({ autoBind = true, once, timeout = 0, handle, channel }: IpcChannelOptions) {
  const ipcChannel = {
    channel: channel,
    handleInMain: () => {
      logger.info(`[IPC]: setup channel "${channel}"`);
      const ipcHandler = once ? ipcMain.handleOnce : ipcMain.handle;
      ipcHandler(channel, async (event, ...args) => {
        let timerId: any;
        try {
          if (timeout > 0) {
            timerId = setTimeout(() => {
              throw new Error(`[IPC]: response timeout in ${timeout}ms`)
            }, timeout);
          }
          return await handle(...args); // todo: maybe exec in separate thread/worker
        } catch (error) {
          throw error
        } finally {
          clearTimeout(timerId);
        }
      })
    },
    removeHandler() {
      ipcMain.removeHandler(channel);
    },
    invokeFromRenderer: async <T>(...args: any[]): Promise<T> => {
      return ipcRenderer.invoke(channel, ...args);
    },
  }
  if (autoBind && ipcMain) {
    ipcChannel.handleInMain();
  }
  return ipcChannel;
}

export interface IpcBroadcastParams<A extends any[] = any> {
  channel: IpcChannel
  webContentId?: number; // send to single webContents view
  frameId?: number; // send to inner frame of webContents
  filter?: (webContent: WebContents) => boolean
  timeout?: number; // todo: add support
  args?: A;
}

export function broadcastIpc({ channel, frameId, webContentId, filter, args = [] }: IpcBroadcastParams) {
  const singleView = webContentId ? webContents.fromId(webContentId) : null;
  let views = singleView ? [singleView] : webContents.getAllWebContents();
  if (filter) {
    views = views.filter(filter);
  }
  views.forEach(webContent => {
    const type = webContent.getType();
    logger.debug(`[IPC]: broadcasting "${channel}" to ${type}=${webContent.id}`, { args });
    webContent.send(channel, ...args);
    if (frameId) {
      webContent.sendToFrame(frameId, channel, ...args)
    }
  })
}
