/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Base http-service / json-api class

import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import { merge } from "lodash";
import type { Response, RequestInit } from "@k8slens/node-fetch";
import type { Patch } from "rfc6902";
import type { PartialDeep, SetRequired, ValueOf } from "type-fest";
import { EventEmitter } from "../../common/event-emitter";
import type { Logger } from "../../common/logger";
import type { Fetch } from "../fetch/fetch.injectable";
import type { Defaulted } from "@k8slens/utilities";
import { object, isObject, isString, json } from "@k8slens/utilities";
import { format, parse, URLSearchParams } from "url";

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

export const usingLensFetch = Symbol("using-lens-fetch");

export interface JsonApiConfig {
  apiBase: string;
  serverAddress: string | typeof usingLensFetch;
  debug?: boolean;
  getRequestOptions?: GetRequestOptions;
}

export interface InternalJsonApiConfig extends JsonApiConfig {
  serverAddress: string | typeof usingLensFetch;
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

export interface JsonApiDependencies {
  fetch: Fetch;
  readonly logger: Logger;
}

interface RequestDetails {
  reqUrl: string;
  reqInit: SetRequired<RequestInit, "method">;
}

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

  constructor(protected readonly dependencies: JsonApiDependencies, public readonly config: InternalJsonApiConfig, reqInit?: RequestInit) {
    this.config = Object.assign({}, JsonApi.configDefault, config);
    this.reqInit = merge({}, JsonApi.reqInitDefault, reqInit);
    this.parseResponse = this.parseResponse.bind(this);
    this.getRequestOptions = config.getRequestOptions ?? (() => Promise.resolve({}));
  }

  public readonly onData = new EventEmitter<[Data, Response]>();
  public readonly onError = new EventEmitter<[JsonApiErrorParsed, Response]>();
  private readonly getRequestOptions: GetRequestOptions;

  private async getRequestDetails(
    path: string,
    query: Partial<Record<string, string>> | undefined,
    init: RequestInit,
  ): Promise<RequestDetails> {
    const reqUrl = (() => {
      const base = this.config.serverAddress === usingLensFetch
        ? parse(`${this.config.apiBase}${path}`)
        : parse(`${this.config.serverAddress}${this.config.apiBase}${path}`);
      const searchParams = new URLSearchParams(base.query ?? undefined);

      for (const [key, value] of object.entries(query ?? {})) {
        searchParams.append(key, value);
      }

      return format({ ...base, query: searchParams.toString() });
    })();
    const reqInit = await (async () => {
      const baseInit: SetRequired<RequestInit, "method"> = { method: "get" };

      if (this.config.serverAddress !== usingLensFetch) {
        baseInit.agent = this.config.serverAddress.startsWith("https://")
          ? httpsAgent
          : httpAgent;
      }

      return merge(
        baseInit,
        this.reqInit,
        await this.getRequestOptions(),
        init,
      );
    })();

    return { reqInit, reqUrl };
  }

  async getResponse<Query>(
    path: string,
    params?: ParamsAndQuery<Params, Query>,
    init: RequestInit = {},
  ): Promise<Response> {
    const { reqInit, reqUrl } = await this.getRequestDetails(
      path,
      params?.query as Partial<Record<string, string>>,
      init,
    );

    return this.dependencies.fetch(reqUrl, reqInit);
  }

  get<OutData = Data, Query = QueryParams>(
    path: string,
    params?: ParamsAndQuery<Params, Query>,
    reqInit: RequestInit = {},
  ) {
    return this.request<OutData, Query>(path, params, { ...reqInit, method: "get" });
  }

  post<OutData = Data, Query = QueryParams>(
    path: string,
    params?: ParamsAndQuery<Params, Query>,
    reqInit: RequestInit = {},
  ) {
    return this.request<OutData, Query>(path, params, { ...reqInit, method: "post" });
  }

  put<OutData = Data, Query = QueryParams>(
    path: string,
    params?: ParamsAndQuery<Params, Query>,
    reqInit: RequestInit = {},
  ) {
    return this.request<OutData, Query>(path, params, { ...reqInit, method: "put" });
  }

  patch<OutData = Data, Query = QueryParams>(
    path: string,
    params?: (ParamsAndQuery<Omit<Params, "data">, Query> & { data?: Patch | PartialDeep<Data> }),
    reqInit: RequestInit = {},
  ) {
    return this.request<OutData, Query>(path, params, { ...reqInit, method: "patch" });
  }

  del<OutData = Data, Query = QueryParams>(
    path: string,
    params?: ParamsAndQuery<Params, Query>,
    reqInit: RequestInit = {},
  ) {
    return this.request<OutData, Query>(path, params, { ...reqInit, method: "delete" });
  }

  protected async request<OutData, Query = QueryParams>(
    path: string,
    rawParams: (ParamsAndQuery<Omit<Params, "data">, Query> & { data?: unknown }) | undefined,
    init: Defaulted<RequestInit, "method">,
  ) {
    const { data, query } = rawParams ?? {};
    const { reqInit, reqUrl } = await this.getRequestDetails(
      path,
      query as Partial<Record<string, string>>,
      init,
    );

    if (data && !reqInit.body) {
      reqInit.body = JSON.stringify(data);
    }

    const res = await this.dependencies.fetch(reqUrl, reqInit);
    const infoLog: JsonApiLog = {
      method: reqInit.method.toUpperCase(),
      reqUrl,
      reqInit,
    };

    return await this.parseResponse(res, infoLog) as OutData;
  }

  protected async parseResponse(res: Response, log: JsonApiLog): Promise<Data> {
    const { status } = res;

    const text = await res.text();
    const parseResponse = json.parse(text || "{}");
    const data = parseResponse.callWasSuccessful
      ? parseResponse.response as Data
      : text as Data;

    if (status >= 200 && status < 300) {
      this.onData.emit(data, res);
      this.writeLog({ ...log, data });

      return data;
    }

    if (log.method === "GET" && res.status === 403) {
      this.writeLog({ ...log, error: data });
      throw data;
    }

    const error = new JsonApiErrorParsed(data as JsonApiError, this.parseError(data, res));

    this.onError.emit(error, res);
    this.writeLog({ ...log, error });

    throw error;
  }

  protected parseError(error: unknown, res: Response): string[] {
    if (isString(error)) {
      return [error];
    }

    if (!isObject(error)) {
      return [];
    }

    if (Array.isArray(error.errors)) {
      return error.errors.map(error => error.title);
    }

    if (isString(error.message)) {
      return [error.message];
    }

    return [res.statusText || "Error!"];
  }

  protected writeLog(log: JsonApiLog) {
    const { method, reqUrl, ...params } = log;

    this.dependencies.logger.debug(`[JSON-API] request ${method} ${reqUrl}`, params);
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
