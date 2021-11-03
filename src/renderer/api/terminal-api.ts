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

import { boundMethod, base64, EventEmitter } from "../utils";
import { WebSocketApi } from "./websocket-api";
import isEqual from "lodash/isEqual";
import { isDevelopment } from "../../common/vars";
import url from "url";
import { makeObservable, observable } from "mobx";
import type { ParsedUrlQueryInput } from "querystring";

export enum TerminalChannels {
  STDIN = 0,
  STDOUT = 1,
  STDERR = 2,
  TERMINAL_SIZE = 4,
  TOKEN = 9,
}

enum TerminalColor {
  RED = "\u001b[31m",
  GREEN = "\u001b[32m",
  YELLOW = "\u001b[33m",
  BLUE = "\u001b[34m",
  MAGENTA = "\u001b[35m",
  CYAN = "\u001b[36m",
  GRAY = "\u001b[90m",
  LIGHT_GRAY = "\u001b[37m",
  NO_COLOR = "\u001b[0m",
}

export type TerminalApiQuery = Record<string, string> & {
  id: string;
  node?: string;
  type?: string | "node";
};

export class TerminalApi extends WebSocketApi {
  protected size: { Width: number; Height: number };

  public onReady = new EventEmitter<[]>();
  @observable public isReady = false;
  public readonly url: string;

  constructor(protected options: TerminalApiQuery) {
    super({
      logging: isDevelopment,
      flushOnOpen: false,
      pingIntervalSeconds: 30,
    });
    makeObservable(this);

    const { hostname, protocol, port } = location;
    const query: ParsedUrlQueryInput = {
      id: options.id,
    };

    if (options.node) {
      query.node = options.node;
      query.type = options.type || "node";
    }

    this.url = url.format({
      protocol: protocol.includes("https") ? "wss" : "ws",
      hostname,
      port,
      pathname: "/api",
      query,
      slashes: true,
    });
  }

  connect() {
    this.emitStatus("Connecting ...");
    this.onData.addListener(this._onReady, { prepend: true });
    super.connect(this.url);
  }

  destroy() {
    if (!this.socket) return;
    const exitCode = String.fromCharCode(4); // ctrl+d

    this.sendCommand(exitCode);
    setTimeout(() => super.destroy(), 2000);
  }

  removeAllListeners() {
    super.removeAllListeners();
    this.onReady.removeAllListeners();
  }

  @boundMethod
  protected _onReady(data: string) {
    if (!data) return true;
    this.isReady = true;
    this.onReady.emit();
    this.onData.removeListener(this._onReady);
    this.flush();
    this.onData.emit(data); // re-emit data

    return false; // prevent calling rest of listeners
  }

  reconnect() {
    super.reconnect();
  }

  sendCommand(key: string, channel = TerminalChannels.STDIN) {
    return this.send(channel + base64.encode(key));
  }

  sendTerminalSize(cols: number, rows: number) {
    const newSize = { Width: cols, Height: rows };

    if (!isEqual(this.size, newSize)) {
      this.sendCommand(JSON.stringify(newSize), TerminalChannels.TERMINAL_SIZE);
      this.size = newSize;
    }
  }

  protected parseMessage(data: string) {
    data = data.substr(1); // skip channel

    return base64.decode(data);
  }

  protected _onOpen(evt: Event) {
    // Client should send terminal size in special channel 4,
    // But this size will be changed by terminal.fit()
    this.sendTerminalSize(120, 80);
    super._onOpen(evt);
  }

  protected _onClose(evt: CloseEvent) {
    super._onClose(evt);
    this.isReady = false;
  }

  protected emitStatus(data: string, options: { color?: TerminalColor; showTime?: boolean } = {}) {
    const { color, showTime } = options;

    if (color) {
      data = `${color}${data}${TerminalColor.NO_COLOR}`;
    }
    let time;

    if (showTime) {
      time = `${(new Date()).toLocaleString()} `;
    }
    this.onData.emit(`${showTime ? time : ""}${data}\r\n`);
  }

  protected emitError(error: string) {
    this.emitStatus(error, {
      color: TerminalColor.RED,
    });
  }
}
