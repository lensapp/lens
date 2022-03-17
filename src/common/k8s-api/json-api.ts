/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Base http-service / json-api class

import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import { merge } from "lodash";
import type { Response, RequestInit } from "node-fetch";
import fetch from "node-fetch";
import { stringify } from "querystring";
import { EventEmitter } from "../../common/event-emitter";
import logger from "../../common/logger";
import type { Defaulted } from "../utils";
import { json } from "../utils";

export interface JsonApiData {}

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

export type GetRequestOptions = () => Promise<RequestInit>;

export interface JsonApiConfig {
  apiBase: string;
  serverAddress: string;
  debug?: boolean;
  getRequestOptions?: GetRequestOptions;
}

const httpAgent = new HttpAgent({ keepAlive: true });
const httpsAgent = new HttpsAgent({ keepAlive: true });

export class JsonApi<D = JsonApiData, P extends JsonApiParams = JsonApiParams> {
  static readonly reqInitDefault = {
    headers: {
      "content-type": "application/json",
    },
  };
  protected readonly reqInit: Defaulted<RequestInit, keyof typeof JsonApi["reqInitDefault"]>;

  static readonly configDefault: Partial<JsonApiConfig> = {
    debug: false,
  };

  constructor(public readonly config: JsonApiConfig, reqInit?: RequestInit) {
    this.config = Object.assign({}, JsonApi.configDefault, config);
    this.reqInit = merge({}, JsonApi.reqInitDefault, reqInit);
    this.parseResponse = this.parseResponse.bind(this);
    this.getRequestOptions = config.getRequestOptions ?? (() => Promise.resolve({}));
  }

  public readonly onData = new EventEmitter<[D, Response]>();
  public readonly onError = new EventEmitter<[JsonApiErrorParsed, Response]>();
  private readonly getRequestOptions: GetRequestOptions;

  get<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    return this.request<T>(path, params, { ...reqInit, method: "get" });
  }

  async getResponse(path: string, params?: P, init: RequestInit = {}): Promise<Response> {
    let reqUrl = `${this.config.serverAddress}${this.config.apiBase}${path}`;
    const reqInit = merge(
      {
        method: "get",
        agent: reqUrl.startsWith("https:") ? httpsAgent : httpAgent,
      },
      this.reqInit,
      await this.getRequestOptions(),
      init,
    );
    const { query } = params || {} as P;

    if (query) {
      const queryString = stringify(query);

      reqUrl += (reqUrl.includes("?") ? "&" : "?") + queryString;
    }

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

  protected async request<D>(path: string, params: P | undefined, init: Defaulted<RequestInit, "method">) {
    let reqUrl = `${this.config.serverAddress}${this.config.apiBase}${path}`;
    const reqInit = merge(
      {},
      this.reqInit,
      await this.getRequestOptions(),
      init,
    );
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
    let data: any;

    try {
      data = text ? json.parse(text) : ""; // DELETE-requests might not have response-body
    } catch (e) {
      data = text;
    }

    if (status >= 200 && status < 300) {
      this.onData.emit(data, res);
      this.writeLog({ ...log, data });

      return data;
    }

    if (log.method === "GET" && res.status === 403) {
      this.writeLog({ ...log, error: data });
      throw data;
    }

    const error = new JsonApiErrorParsed(data, this.parseError(data, res));

    this.onError.emit(error, res);
    this.writeLog({ ...log, error });

    throw error;
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
    const { method, reqUrl, ...params } = log;

    logger.debug(`[JSON-API] request ${method} ${reqUrl}`, params);
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
