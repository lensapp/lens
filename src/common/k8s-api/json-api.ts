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

// Base http-service / json-api class

import { merge } from "lodash";
import fetch, { Response, RequestInit } from "node-fetch";
import { stringify } from "querystring";
import { EventEmitter } from "../../common/event-emitter";
import logger from "../../common/logger";

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

export interface JsonApiConfig {
  apiBase: string;
  serverAddress: string;
  debug?: boolean;
  getRequestOptions?: () => Promise<RequestInit>;
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

  constructor(public readonly config: JsonApiConfig, protected reqInit?: RequestInit) {
    this.config = Object.assign({}, JsonApi.configDefault, config);
    this.reqInit = merge({}, JsonApi.reqInitDefault, reqInit);
    this.parseResponse = this.parseResponse.bind(this);
    this.getRequestOptions = config.getRequestOptions ?? (() => Promise.resolve({}));
  }

  public onData = new EventEmitter<[D, Response]>();
  public onError = new EventEmitter<[JsonApiErrorParsed, Response]>();
  
  private getRequestOptions: JsonApiConfig["getRequestOptions"];

  get<T = D>(path: string, params?: P, reqInit: RequestInit = {}) {
    return this.request<T>(path, params, { ...reqInit, method: "get" });
  }

  async getResponse(path: string, params?: P, init: RequestInit = {}): Promise<Response> {
    let reqUrl = `${this.config.serverAddress}${this.config.apiBase}${path}`;
    const reqInit: RequestInit = merge(
      {},
      this.reqInit,
      await this.getRequestOptions(),
      init
    );
    const { query } = params || {} as P;

    if (!reqInit.method) {
      reqInit.method = "get";
    }

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

  protected async request<D>(path: string, params?: P, init: RequestInit = {}) {
    let reqUrl = `${this.config.serverAddress}${this.config.apiBase}${path}`;
    const reqInit: RequestInit = merge(
      {},
      this.reqInit,
      await this.getRequestOptions(),
      init
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
    let data;

    try {
      data = text ? JSON.parse(text) : ""; // DELETE-requests might not have response-body
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
