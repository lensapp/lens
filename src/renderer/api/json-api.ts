// Base http-service / json-api class

import { stringify } from "querystring";
import { EventEmitter } from "../../common/event-emitter";
import { randomBytes } from "crypto";

export interface JsonApiData {
}

export interface JsonApiError {
  code?: number;
  message?: string;
  errors?: { id: string; title: string; status?: number }[];
}

export interface JsonApiParams<D = any> {
  query?: { [param: string]: string | number | any };
  data?: D; // request body
}

export interface JsonApiLog {
  method: string;
  reqUrl: string;
  reqInit: RequestInit;
  data?: any;
  error?: any;
}

export interface JsonApiConfig {
  apiBase: string;
  debug?: boolean;
}

export class JsonApi<D = JsonApiData, P extends JsonApiParams = JsonApiParams> {
  static reqInitDefault: RequestInit = {
    headers: {
      "content-type": "application/json"
    }
  };

  static configDefault: Partial<JsonApiConfig> = {
    debug: false
  };

  constructor(protected config: JsonApiConfig, protected reqInit?: RequestInit) {
    this.config = Object.assign({}, JsonApi.configDefault, config);
    this.reqInit = Object.assign({}, JsonApi.reqInitDefault, reqInit);
    this.parseResponse = this.parseResponse.bind(this);
  }

  public onData = new EventEmitter<[D, Response]>();
  public onError = new EventEmitter<[JsonApiErrorParsed, Response]>();

  get<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    return this.request<T>(path, params, { ...reqInit, method: "get" });
  }

  getResponse(path: string, params?: P, init: RequestInit = {}): Promise<Response> {
    const reqPath = `${this.config.apiBase}${path}`;
    const subdomain = randomBytes(2).toString("hex");
    let reqUrl = `http://${subdomain}.${window.location.host}${reqPath}`; // hack around browser connection limits (chromium allows 6 per domain)
    const reqInit: RequestInit = { ...init };
    const { query } = params || {} as P;

    if (!reqInit.method) {
      reqInit.method = "get";
    }

    if (query) {
      const queryString = stringify(query);

      reqUrl += (reqUrl.includes("?") ? "&" : "?") + queryString;
    }

    this.writeLog({
      method: reqInit.method.toUpperCase(),
      reqUrl: reqPath,
      reqInit,
    });

    return fetch(reqUrl, reqInit);
  }

  post<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    return this.request<T>(path, params, { ...reqInit, method: "post" });
  }

  put<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    return this.request<T>(path, params, { ...reqInit, method: "put" });
  }

  patch<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    return this.request<T>(path, params, { ...reqInit, method: "PATCH" });
  }

  del<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    return this.request<T>(path, params, { ...reqInit, method: "delete" });
  }

  protected async request<D>(path: string, params?: P, init: RequestInit = {}) {
    let reqUrl = this.config.apiBase + path;
    const reqInit: RequestInit = { ...this.reqInit, ...init };
    const { data, query } = params || {} as P;

    if (data && !reqInit.body) {
      reqInit.body = JSON.stringify(data);
    }

    if (query) {
      const queryString = stringify(query);

      reqUrl += (reqUrl.includes("?") ? "&" : "?") + queryString;
    }
    const infoLog: JsonApiLog = {
      method: reqInit.method.toUpperCase(),
      reqUrl,
      reqInit,
    };

    const res = await fetch(reqUrl, reqInit);

    return this.parseResponse<D>(res, infoLog);
  }

  protected async parseResponse<D>(res: Response, log: JsonApiLog): Promise<D> {
    const { status } = res;

    const text = await res.text();
    let data;

    try {
      data = text ? JSON.parse(text) : ""; // DELETE-requests might not have response-body
    } catch (e) {
      data = text;
    }

    if (status >= 200 && status < 300) {
      console.log(data, res);
      this.onData.emit(data, res);
      this.writeLog({ ...log, data });

      return data;
    }

    if (log.method === "GET" && res.status === 403) {
      this.writeLog({ ...log, error: data });
      throw data;
    } else {
      const error = new JsonApiErrorParsed(data, this.parseError(data, res));

      this.onError.emit(error, res);
      this.writeLog({ ...log, error });
      throw error;
    }
  }

  protected parseError(error: JsonApiError | string, res: Response): string[] {
    if (typeof error === "string") {
      return [error];
    }

    if (Array.isArray(error.errors)) {
      return error.errors.map(error => error.title);
    }

    if (error.message) {
      return [error.message];
    }

    return [res.statusText || "Error!"];
  }

  protected writeLog(log: JsonApiLog) {
    if (!this.config.debug) return;
    const { method, reqUrl, ...params } = log;
    let textStyle = "font-weight: bold;";

    if (params.data) textStyle += "background: green; color: white;";
    if (params.error) textStyle += "background: red; color: white;";
    console.log(`%c${method} ${reqUrl}`, textStyle, params);
  }
}

export class JsonApiErrorParsed {
  isUsedForNotification = false;

  constructor(private error: JsonApiError | DOMException, private messages: string[]) {
  }

  get isAborted() {
    return this.error.code === DOMException.ABORT_ERR;
  }

  toString() {
    return this.messages.join("\n");
  }
}
