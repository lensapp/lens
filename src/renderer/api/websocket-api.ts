/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { observable, makeObservable } from "mobx";
import EventEmitter from "events";
import type TypedEventEmitter from "typed-emitter";
import type { Arguments } from "typed-emitter";
import { isDevelopment } from "../../common/vars";
import logger from "../../common/logger";

interface WebsocketApiParams {
  /**
   * Flush pending commands on open socket
   *
   * @default true
   */
  flushOnOpen?: boolean;

  /**
   * In case of an error, wait this many seconds before reconnecting.
   *
   * If falsy, don't reconnect
   *
   * @default 10
   */
  reconnectDelay?: number;

  /**
   * The message for pinging the websocket
   *
   * @default "PING"
   */
  pingMessage?: string | ArrayBufferLike | Blob | ArrayBufferView;

  /**
   * If set to a number > 0, then the API will ping the socket on that interval.
   *
   * @unit seconds
   */
  pingInterval?: number;

  /**
   * Whether to show logs in the console
   *
   * @default isDevelopment
   */
  logging?: boolean;
}

export enum WebSocketApiState {
  PENDING = "pending",
  OPEN = "open",
  CONNECTING = "connecting",
  RECONNECTING = "reconnecting",
  CLOSED = "closed",
}

export interface WebSocketEvents {
  open: () => void,
  data: (message: string) => void;
  close: () => void;
}

type Defaulted<Params, DefaultParams extends keyof Params> = Required<Pick<Params, DefaultParams>> & Omit<Params, DefaultParams>;

export class WebSocketApi<Events extends WebSocketEvents> extends (EventEmitter as { new<T>(): TypedEventEmitter<T> })<Events> {
  protected socket: WebSocket;
  protected pendingCommands: (string | ArrayBufferLike | Blob | ArrayBufferView)[] = [];
  protected reconnectTimer?: any;
  protected pingTimer?: any;
  protected params: Defaulted<WebsocketApiParams, keyof typeof WebSocketApi["defaultParams"]>;

  @observable readyState = WebSocketApiState.PENDING;

  private static defaultParams = {
    logging: isDevelopment,
    reconnectDelay: 10,
    flushOnOpen: true,
    pingMessage: "PING",
  };

  constructor(params: WebsocketApiParams) {
    super();
    makeObservable(this);
    this.params = Object.assign({}, WebSocketApi.defaultParams, params);
    const { pingInterval } = this.params;

    if (pingInterval) {
      this.pingTimer = setInterval(() => this.ping(), pingInterval * 1000);
    }
  }

  get isConnected() {
    return this.socket?.readyState === WebSocket.OPEN && this.isOnline;
  }

  get isOnline() {
    return navigator.onLine;
  }

  connect(url: string) {
    // close previous connection first
    this.socket?.close();

    // start new connection
    this.socket = new WebSocket(url);
    this.socket.addEventListener("open", ev => this._onOpen(ev));
    this.socket.addEventListener("message", ev => this._onMessage(ev));
    this.socket.addEventListener("error", ev => this._onError(ev));
    this.socket.addEventListener("close", ev => this._onClose(ev));
    this.readyState = WebSocketApiState.CONNECTING;
  }

  ping() {
    if (this.isConnected) {
      this.send(this.params.pingMessage);
    }
  }

  reconnect(): void {
    if (!this.socket) {
      return void logger.error("[WEBSOCKET-API]: cannot reconnect to a socket that is not connected");
    }

    this.connect(this.socket.url);
  }

  destroy() {
    if (!this.socket) return;
    this.socket.close();
    this.socket = null;
    this.pendingCommands = [];
    this.clearAllListeners();
    clearTimeout(this.reconnectTimer);
    clearInterval(this.pingTimer);
    this.readyState = WebSocketApiState.PENDING;
  }

  clearAllListeners() {
    for (const name of this.eventNames()) {
      this.removeAllListeners(name as keyof Events);
    }
  }

  send(command: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (this.isConnected) {
      this.socket.send(command);
    } else {
      this.pendingCommands.push(command);
    }
  }

  protected flush() {
    for (const command of this.pendingCommands) {
      this.send(command);
    }

    this.pendingCommands.length = 0;
  }

  protected _onOpen(evt: Event) {
    this.emit("open", ...[] as Arguments<Events["open"]>);
    if (this.params.flushOnOpen) this.flush();
    this.readyState = WebSocketApiState.OPEN;
    this.writeLog("%cOPEN", "color:green;font-weight:bold;", evt);
  }

  protected _onMessage({ data }: MessageEvent): void {
    this.emit("data", ...[data] as Arguments<Events["data"]>);
    this.writeLog("%cMESSAGE", "color:black;font-weight:bold;", data);
  }

  protected _onError(evt: Event) {
    this.writeLog("%cERROR", "color:red;font-weight:bold;", evt);
  }

  protected _onClose(evt: CloseEvent) {
    const error = evt.code !== 1000 || !evt.wasClean;

    if (error) {
      const { reconnectDelay } = this.params;

      if (reconnectDelay) {
        const url = this.socket.url;

        this.writeLog("will reconnect in", `${reconnectDelay}s`);

        this.reconnectTimer = setTimeout(() => this.connect(url), reconnectDelay * 1000);
        this.readyState = WebSocketApiState.RECONNECTING;
      }
    } else {
      this.readyState = WebSocketApiState.CLOSED;
      this.emit("close", ...[] as Arguments<Events["close"]>);
    }
    this.writeLog("%cCLOSE", `color:${error ? "red" : "black"};font-weight:bold;`, evt);
  }

  protected writeLog(...data: any[]) {
    if (this.params.logging) {
      logger.debug(...data);
    }
  }
}
