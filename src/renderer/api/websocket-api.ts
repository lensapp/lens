import { observable } from "mobx";
import { EventEmitter } from "../../common/event-emitter";

interface IParams {
  url?: string;          // connection url, starts with ws:// or wss://
  autoConnect?: boolean; // auto-connect in constructor
  flushOnOpen?: boolean; // flush pending commands on open socket
  reconnectDelaySeconds?: number; // reconnect timeout in case of error (0 - don't reconnect)
  pingIntervalSeconds?: number; // send ping message for keeping connection alive in some env, e.g. AWS (0 - don't ping)
  logging?: boolean;    // show logs in console
}

interface IMessage {
  id: string;
  data: string;
}

export enum WebSocketApiState {
  PENDING = -1,
  OPEN,
  CONNECTING,
  RECONNECTING,
  CLOSED,
}

export class WebSocketApi {
  protected socket: WebSocket;
  protected pendingCommands: IMessage[] = [];
  protected reconnectTimer: any;
  protected pingTimer: any;
  protected pingMessage = "PING";

  @observable readyState = WebSocketApiState.PENDING;

  public onOpen = new EventEmitter<[]>();
  public onData = new EventEmitter<[string]>();
  public onClose = new EventEmitter<[]>();

  static defaultParams: Partial<IParams> = {
    autoConnect: true,
    logging: false,
    reconnectDelaySeconds: 10,
    pingIntervalSeconds: 0,
    flushOnOpen: true,
  };

  constructor(protected params: IParams) {
    this.params = Object.assign({}, WebSocketApi.defaultParams, params);
    const { autoConnect, pingIntervalSeconds } = this.params;
    if (autoConnect) {
      setTimeout(() => this.connect());
    }
    if (pingIntervalSeconds) {
      this.pingTimer = setInterval(() => this.ping(), pingIntervalSeconds * 1000);
    }
  }

  get isConnected() {
    const state = this.socket ? this.socket.readyState : -1;
    return state === WebSocket.OPEN && this.isOnline;
  }

  get isOnline() {
    return navigator.onLine;
  }

  setParams(params: Partial<IParams>) {
    Object.assign(this.params, params);
  }

  connect(url = this.params.url) {
    if (this.socket) {
      this.socket.close(); // close previous connection first
    }
    this.socket = new WebSocket(url);
    this.socket.onopen = this._onOpen.bind(this);
    this.socket.onmessage = this._onMessage.bind(this);
    this.socket.onerror = this._onError.bind(this);
    this.socket.onclose = this._onClose.bind(this);
    this.readyState = WebSocketApiState.CONNECTING;
  }

  ping() {
    if (!this.isConnected) return;
    this.send(this.pingMessage);
  }

  reconnect() {
    const { reconnectDelaySeconds } = this.params;
    if (!reconnectDelaySeconds) return;
    this.writeLog('reconnect after', reconnectDelaySeconds + "ms");
    this.reconnectTimer = setTimeout(() => this.connect(), reconnectDelaySeconds * 1000);
    this.readyState = WebSocketApiState.RECONNECTING;
  }

  destroy() {
    if (!this.socket) return;
    this.socket.close();
    this.socket = null;
    this.pendingCommands = [];
    this.removeAllListeners();
    clearTimeout(this.reconnectTimer);
    clearInterval(this.pingTimer);
    this.readyState = WebSocketApiState.PENDING;
  }

  removeAllListeners() {
    this.onOpen.removeAllListeners();
    this.onData.removeAllListeners();
    this.onClose.removeAllListeners();
  }

  send(command: string) {
    const msg: IMessage = {
      id: (Math.random() * Date.now()).toString(16).replace(".", ""),
      data: command,
    };
    if (this.isConnected) {
      this.socket.send(msg.data);
    }
    else {
      this.pendingCommands.push(msg);
    }
  }

  protected flush() {
    this.pendingCommands.forEach(msg => this.send(msg.data));
    this.pendingCommands.length = 0;
  }

  protected parseMessage(data: string) {
    return data;
  }

  protected _onOpen(evt: Event) {
    this.onOpen.emit();
    if (this.params.flushOnOpen) this.flush();
    this.readyState = WebSocketApiState.OPEN;
    this.writeLog('%cOPEN', 'color:green;font-weight:bold;', evt);
  }

  protected _onMessage(evt: MessageEvent) {
    const data = this.parseMessage(evt.data);
    this.onData.emit(data);
    this.writeLog('%cMESSAGE', 'color:black;font-weight:bold;', data);
  }

  protected _onError(evt: Event) {
    this.writeLog('%cERROR', 'color:red;font-weight:bold;', evt)
  }

  protected _onClose(evt: CloseEvent) {
    const error = evt.code !== 1000 || !evt.wasClean;
    if (error) {
      this.reconnect();
    }
    else {
      this.readyState = WebSocketApiState.CLOSED;
      this.onClose.emit();
    }
    this.writeLog('%cCLOSE', `color:${error ? "red" : "black"};font-weight:bold;`, evt);
  }

  protected writeLog(...data: any[]) {
    if (this.params.logging) {
      console.log(...data);
    }
  }
}
