/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { JsonApi, JsonApiData, JsonApiError } from "./json-api";
import type { Response } from "node-fetch";
import { apiKubePrefix, isDebugging } from "../vars";
import { apiBase } from "./api-base";

export interface KubeJsonApiListMetadata {
  resourceVersion: string;
  selfLink?: string;
}

export interface KubeJsonApiDataList<T = KubeJsonApiData> {
  kind: string;
  apiVersion: string;
  items: T[];
  metadata: KubeJsonApiListMetadata;
}

export interface KubeJsonApiMetadata {
  uid: string;
  name: string;
  namespace?: string;
  creationTimestamp?: string;
  resourceVersion: string;
  continue?: string;
  finalizers?: string[];
  selfLink?: string;
  labels?: {
    [label: string]: string;
  };
  annotations?: {
    [annotation: string]: string;
  };
  [key: string]: any;
}

export interface KubeJsonApiData extends JsonApiData {
  kind: string;
  apiVersion: string;
  metadata: KubeJsonApiMetadata;
}

export interface KubeJsonApiError extends JsonApiError {
  code: number;
  status: string;
  message?: string;
  reason: string;
  details: {
    name: string;
    kind: string;
  };
}

export class KubeJsonApi extends JsonApi<KubeJsonApiData> {
  static forCluster(clusterId: string): KubeJsonApi {
    const url = new URL(apiBase.config.serverAddress);

    return new this({
      serverAddress: apiBase.config.serverAddress,
      apiBase: apiKubePrefix,
      debug: isDebugging,
    }, {
      headers: {
        "Host": `${clusterId}.localhost:${url.port}`,
      },
    });
  }

  protected parseError(error: KubeJsonApiError | any, res: Response): string[] {
    const { status, reason, message } = error;

    if (status && reason) {
      return [message || `${status}: ${reason}`];
    }

    return super.parseError(error, res);
  }
}
