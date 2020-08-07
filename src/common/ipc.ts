// Inter-protocol communications (main <-> renderer)
// https://www.electronjs.org/docs/api/ipc-main
// https://www.electronjs.org/docs/api/ipc-renderer

import { ipcMain, ipcRenderer, IpcRendererEvent, WebContents, webContents } from "electron"
import logger from "../main/logger";
import { getRandId } from "./utils";

export type IpcChannel = string;

export enum IpcMode {
  SYNC = "sync",
  ASYNC = "async",
}

export interface IpcChannelRequest<A extends any[] = any> {
  msgId: string;
  args: A;
}

export interface IpcChannelResponse<T extends any[] = any, E = any> {
  msgId: string;
  data?: T;
  error?: E;
}

export interface IpcChannelInit {
  channel: IpcChannel; // main <-> renderer communication channel name
  mode?: IpcMode; // default: "async", use "sync" as last resort: https://www.electronjs.org/docs/api/ipc-renderer#ipcrenderersendsyncchannel-args
  handle?: (...args: any[]) => any; // main-process message handler
  autoBind?: boolean; // auto-bind message handler in main-process, default: false
  timeout?: number; // timeout for waiting response from the sender
  once?: boolean; // todo: add support
}

export function createIpcChannel({ autoBind = false, mode = IpcMode.ASYNC, timeout = 0, handle, channel }: IpcChannelInit) {
  channel = `${mode}:${channel}`

  const ipcChannel = {
    channel: channel,
    handleInMain: () => {
      logger.info(`[IPC]: setup channel "${channel}"`);

      ipcMain.on(channel, async (event, req: IpcChannelRequest) => {
        let resolved = false;
        let timerId: any;

        function resolve(res: Partial<IpcChannelResponse>) {
          if (resolved) return;
          res.msgId = req.msgId; // return back to sender to be able to handle response
          resolved = true
          logger.info(`[IPC]: sending response to "${channel}"`, res);
          if (mode === IpcMode.ASYNC) {
            event.reply(channel, res);
          }
          if (mode === IpcMode.SYNC) {
            event.returnValue = res;
          }
        }

        if (timeout > 0) {
          timerId = setTimeout(() => {
            const timeoutError = new Error(`[IPC]: response timeout in ${timeout}ms`);
            resolve({ error: timeoutError })
          }, timeout);
        }

        try {
          const data = await handle(...req.args); // todo: maybe exec in separate thread/worker
          resolve({ data })
        } catch (error) {
          resolve({
            error: String(error)
          })
        } finally {
          clearTimeout(timerId);
        }
      })
    },
    invokeFromRenderer: async (...args: any[]) => {
      const req: IpcChannelRequest = {
        msgId: getRandId({ prefix: "ipc-msg-id" }),
        args: args,
      }
      logger.info(`[IPC]: "${channel}" sending message to main`, req);
      if (mode === IpcMode.ASYNC) {
        ipcRenderer.send(channel, req)
      }
      if (mode === IpcMode.SYNC) {
        ipcRenderer.sendSync(channel, req)
      }
      return new Promise(async (resolve, reject) => {
        ipcRenderer.on(channel, function waitResponseHandler(event: IpcRendererEvent, res: IpcChannelResponse) {
          if (req.msgId === res.msgId) {
            const meta = { ...req, ...res };
            if (res.data) {
              logger.info(`[IPC]: "${channel}" resolve`, meta);
              resolve(res.data);
            }
            if (res.error) {
              logger.error(`[IPC]: "${channel}" reject`, meta);
              reject(res.error);
            }
            ipcRenderer.off(channel, waitResponseHandler); // unsubscribe since handled
          }
        });
      })
    },
  }
  if (autoBind && ipcMain) {
    ipcChannel.handleInMain();
  }
  return ipcChannel;
}

export interface IpcBroadcastParams<A extends any[] = any> {
  channel: IpcChannel
  webContentId?: number; // sends to single webContents view
  filter?: (webContent: WebContents) => boolean
  timeout?: number; // todo: add support
  args?: A;
}

export function broadcastIpc({ channel, webContentId, filter, args = [] }: IpcBroadcastParams) {
  const singleView = webContentId ? webContents.fromId(webContentId) : null;
  let views = singleView ? [singleView] : webContents.getAllWebContents();
  if (filter) {
    views = views.filter(filter);
  }
  views.forEach(webContent => {
    const type = webContent.getType();
    logger.debug(`[IPC]: broadcasting "${channel}" to ${type}=${webContent.id}`, { args });
    webContent.send(channel, ...[args].flat());
  })
}
