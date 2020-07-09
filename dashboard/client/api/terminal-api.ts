import { stringify } from "querystring";
import { autobind, base64, EventEmitter, interval } from "../utils";
import { WebSocketApi } from "./websocket-api";
import { configStore } from "../config.store";
import isEqual from "lodash/isEqual";

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

export interface TerminalApiOptions {
  id: string;
  node?: string;
  colorTheme?: "light" | "dark";
}

export class TerminalApi extends WebSocketApi {
  protected size: { Width: number; Height: number };
  protected currentToken: string;
  protected tokenInterval = interval(60, this.sendNewToken); // refresh every minute

  public onReady = new EventEmitter<[]>();
  public isReady = false;

  constructor(protected options: TerminalApiOptions) {
    super({
      logging: configStore.isDevelopment,
      flushOnOpen: false,
      pingIntervalSeconds: 30,
    });
  }

  getUrl(token: string): string {
    const { hostname, protocol } = location;
    const { id, node } = this.options;
    const apiPrefix = configStore.apiPrefix.TERMINAL;
    const wss = `ws${protocol === "https:" ? "s" : ""}://`;
    const queryParams = { token, id };
    if (node) {
      Object.assign(queryParams, {
        node: node,
        type: "node"
      });
    }

    return `${wss}${hostname}${configStore.serverPort}${apiPrefix}/api?${stringify(queryParams)}`;
  }

  async connect(): Promise<void> {
    const token = await configStore.getToken();
    const apiUrl = this.getUrl(token);
    const { colorTheme } = this.options;
    this.emitStatus("Connecting ...", {
      color: colorTheme == "light" ? TerminalColor.GRAY : TerminalColor.LIGHT_GRAY
    });
    this.onData.addListener(this._onReady, { prepend: true });
    this.currentToken = token;
    this.tokenInterval.start();
    return super.connect(apiUrl);
  }

  @autobind()
  async sendNewToken(): Promise<void> {
    const token = await configStore.getToken();
    if (!this.isReady || token == this.currentToken) {
      return;
    }
    this.sendCommand(token, TerminalChannels.TOKEN);
    this.currentToken = token;
  }

  destroy(): void {
    if (!this.socket) {
      return;
    }
    const exitCode = String.fromCharCode(4); // ctrl+d
    this.sendCommand(exitCode);
    this.tokenInterval.stop();
    setTimeout(() => super.destroy(), 2000);
  }

  removeAllListeners(): void {
    super.removeAllListeners();
    this.onReady.removeAllListeners();
  }

  @autobind()
  protected _onReady(data: string): boolean | undefined {
    if (!data) {
      return;
    }
    this.isReady = true;
    this.onReady.emit();
    this.onData.removeListener(this._onReady);
    this.flush();
    this.onData.emit(data); // re-emit data
    return false; // prevent calling rest of listeners
  }

  reconnect(): void {
    super.reconnect();
  }

  sendCommand(key: string, channel = TerminalChannels.STDIN): any {
    return this.send(channel + base64.encode(key));
  }

  sendTerminalSize(cols: number, rows: number): void {
    const newSize = { Width: cols, Height: rows };
    if (!isEqual(this.size, newSize)) {
      this.sendCommand(JSON.stringify(newSize), TerminalChannels.TERMINAL_SIZE);
      this.size = newSize;
    }
  }

  protected parseMessage(data: string): any {
    data = data.substr(1); // skip channel
    return base64.decode(data);
  }

  protected _onOpen(evt: Event): void {
    // Client should send terminal size in special channel 4,
    // But this size will be changed by terminal.fit()
    this.sendTerminalSize(120, 80);
    super._onOpen(evt);
  }

  protected _onClose(evt: CloseEvent): void {
    super._onClose(evt);
    this.isReady = false;
  }

  protected emitStatus(data: string, options: { color?: TerminalColor; showTime?: boolean } = {}): void {
    const { color, showTime } = options;
    if (color) {
      data = `${color}${data}${TerminalColor.NO_COLOR}`;
    }
    let time;
    if (showTime) {
      time = (new Date()).toLocaleString() + " ";
    }
    this.onData.emit(`${showTime ? time : ""}${data}\r\n`);
  }

  protected emitError(error: string): void {
    this.emitStatus(error, {
      color: TerminalColor.RED
    });
  }
}
