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
import type { Patch } from "rfc6902";
import type { PartialDeep, ValueOf } from "type-fest";
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

export interface JsonApiParams<D> {
  data?: PartialDeep<D>; // request body
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

export type QueryParam = string | number | boolean | null | undefined | readonly string[] | readonly  number[] | readonly boolean[];
export type QueryParams = Partial<Record<string, QueryParam | undefined>>;

export type ParamsAndQuery<Params, Query> = (
  ValueOf<Query> extends QueryParam
    ? Params & { query?: Query }
    : Params & { query?: undefined }
);

export class JsonApi<Data = JsonApiData, Params extends JsonApiParams<Data> = JsonApiParams<Data>> {
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

  public readonly onData = new EventEmitter<[Data, Response]>();
  public readonly onError = new EventEmitter<[JsonApiErrorParsed, Response]>();
  private readonly getRequestOptions: GetRequestOptions;

  async getResponse<Query>(
    path: string,
    params?: ParamsAndQuery<Params, Query> | undefined,
    init: RequestInit = {},
  ): Promise<Response> {
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
    const { query } = params ?? {};

    if (query) {
      const queryString = stringify(query as unknown as QueryParams);

      reqUrl += (reqUrl.includes("?") ? "&" : "?") + queryString;
    }

    return fetch(reqUrl, reqInit);
  }

  get<OutData = Data, Query = QueryParams>(
    path: string,
    params?: ParamsAndQuery<Params, Query> | undefined,
    reqInit: RequestInit = {},
  ) {
    return this.request<OutData, Query>(path, params, { ...reqInit, method: "get" });
  }

  post<OutData = Data, Query = QueryParams>(
    path: string,
    params?: ParamsAndQuery<Params, Query> | undefined,
    reqInit: RequestInit = {},
  ) {
    return this.request<OutData, Query>(path, params, { ...reqInit, method: "post" });
  }

  put<OutData = Data, Query = QueryParams>(
    path: string,
    params?: ParamsAndQuery<Params, Query> | undefined,
    reqInit: RequestInit = {},
  ) {
    return this.request<OutData, Query>(path, params, { ...reqInit, method: "put" });
  }

  patch<OutData = Data, Query = QueryParams>(
    path: string,
    params?: (ParamsAndQuery<Omit<Params, "data">, Query> & { data?: Patch | PartialDeep<Data> }) | undefined,
    reqInit: RequestInit = {},
  ) {
    return this.request<OutData, Query>(path, params, { ...reqInit, method: "patch" });
  }

  del<OutData = Data, Query = QueryParams>(
    path: string,
    params?: ParamsAndQuery<Params, Query> | undefined,
    reqInit: RequestInit = {},
  ) {
    return this.request<OutData, Query>(path, params, { ...reqInit, method: "delete" });
  }

  protected async request<OutData, Query = QueryParams>(
    path: string,
    params: (ParamsAndQuery<Omit<Params, "data">, Query> & { data?: unknown }) | undefined,
    init: Defaulted<RequestInit, "method">,
  ) {
    let reqUrl = `${this.config.serverAddress}${this.config.apiBase}${path}`;
    const reqInit = merge(
      {},
      this.reqInit,
      await this.getRequestOptions(),
      init,
    );
    const { data, query } = params || {};

    if (data && !reqInit.body) {
      reqInit.body = JSON.stringify(data);
    }

    if (query) {
      const queryString = stringify(query as unknown as QueryParams);

      reqUrl += (reqUrl.includes("?") ? "&" : "?") + queryString;
    }
    const infoLog: JsonApiLog = {
      method: reqInit.method.toUpperCase(),
      reqUrl,
      reqInit,
    };

    const res = await fetch(reqUrl, reqInit);

    return this.parseResponse<OutData>(res, infoLog);
  }

  protected async parseResponse<OutData>(res: Response, log: JsonApiLog): Promise<OutData> {
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
