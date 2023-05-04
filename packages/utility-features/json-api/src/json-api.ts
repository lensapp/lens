/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import { merge } from "lodash";
import { stringify } from "querystring";
import type { Patch } from "rfc6902";
import type { PartialDeep, ValueOf } from "type-fest";
import { EventEmitter } from "@k8slens/event-emitter";
import type { Logger } from "@k8slens/logger";
import type Fetch from "@k8slens/node-fetch";
import type { RequestInit, Response } from "@k8slens/node-fetch";
import type { Defaulted } from "@k8slens/utilities";
import { isObject, isString, json } from "@k8slens/utilities";

export interface JsonApiData {}

export interface JsonApiError {
  code?: number;
  message?: string;
  errors?: { id: string; title: string; status?: number }[];
}

export interface KubeJsonApiErrorCause {
  reason: string;
  message: string;
  field: string;
}

export interface KubeJsonApiErrorDetails {
  name: string;
  group: string;
  kind: string;
  causes: KubeJsonApiErrorCause[];
}

export interface KubeJsonApiError {
  kind: "Status";
  apiVersion: "v1";
  metadata: object;
  status: string;
  message: string;
  reason: string;
  details: KubeJsonApiErrorDetails;
  code: number;
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

export type QueryParam =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly string[]
  | readonly number[]
  | readonly boolean[];
export type QueryParams = Partial<Record<string, QueryParam | undefined>>;

export type ParamsAndQuery<Params, Query> = ValueOf<Query> extends QueryParam
  ? Params & { query?: Query }
  : Params & { query?: undefined };

export interface JsonApiDependencies {
  fetch: typeof Fetch;
  readonly logger: Logger;
}

export class JsonApiErrorParsed {
  isUsedForNotification = false;

  constructor(private error: JsonApiError | DOMException | KubeJsonApiError, private messages: string[]) {}

  get isAborted() {
    return this.error.code === DOMException.ABORT_ERR;
  }

  toString() {
    return this.messages.join("\n");
  }
}

export class JsonApi<Data = JsonApiData, Params extends JsonApiParams<Data> = JsonApiParams<Data>> {
  static readonly reqInitDefault = {
    headers: {
      "content-type": "application/json",
    },
  };

  protected readonly reqInit: Defaulted<RequestInit, keyof (typeof JsonApi)["reqInitDefault"]>;

  static readonly configDefault: Partial<JsonApiConfig> = {
    debug: false,
  };

  constructor(
    protected readonly dependencies: JsonApiDependencies,
    public readonly config: JsonApiConfig,
    reqInit?: RequestInit,
  ) {
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
    params?: ParamsAndQuery<Params, Query>,
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

    if (query && Object.keys(query).length > 0) {
      const queryString = stringify(query as unknown as QueryParams);

      reqUrl += (reqUrl.includes("?") ? "&" : "?") + queryString;
    }

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
    params?: ParamsAndQuery<Omit<Params, "data">, Query> & { data?: Patch | PartialDeep<Data> },
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
    params: (ParamsAndQuery<Omit<Params, "data">, Query> & { data?: unknown }) | undefined,
    init: Defaulted<RequestInit, "method">,
  ) {
    let reqUrl = `${this.config.serverAddress}${this.config.apiBase}${path}`;
    const reqInit = merge({}, this.reqInit, await this.getRequestOptions(), init);
    const { data, query } = params || {};

    if (data && !reqInit.body) {
      reqInit.body = JSON.stringify(data);
    }

    if (query && Object.keys(query).length > 0) {
      const queryString = stringify(query as unknown as QueryParams);

      reqUrl += (reqUrl.includes("?") ? "&" : "?") + queryString;
    }
    const infoLog: JsonApiLog = {
      method: reqInit.method.toUpperCase(),
      reqUrl,
      reqInit,
    };

    const res = await this.dependencies.fetch(reqUrl, reqInit);

    return (await this.parseResponse(res, infoLog)) as OutData;
  }

  protected async parseResponse(res: Response, log: JsonApiLog): Promise<Data> {
    const { status } = res;

    const text = await res.text();
    const parseResponse = json.parse(text || "{}");
    const data = parseResponse.callWasSuccessful ? (parseResponse.response as Data) : (text as Data);

    if (status >= 200 && status < 300) {
      this.onData.emit(data, res);
      this.writeLog({ ...log, data });

      return data;
    }

    if (log.method === "GET" && res.status === 403) {
      this.writeLog({ ...log, error: data });
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw data;
    }

    const error = new JsonApiErrorParsed(data as JsonApiError, this.parseError(data, res));

    this.onError.emit(error, res);
    this.writeLog({ ...log, error });

    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw error;
  }

  protected parseError(error: unknown, res: Response): string[] {
    if (isString(error)) {
      return [error];
    }

    if (!isObject(error)) {
      return [];
    }

    const { errors, message } = error as { errors?: { title: string }[]; message?: string };

    if (Array.isArray(errors)) {
      return errors.map((error) => error.title);
    }

    if (isString(message)) {
      return [message];
    }

    return [res.statusText || "Error!"];
  }

  protected writeLog(log: JsonApiLog) {
    const { method, reqUrl, ...params } = log;

    this.dependencies.logger.debug(`[JSON-API] request ${method} ${reqUrl}`, params);
  }
}
