/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { JsonApi, JsonApiData, JsonApiError } from "./json-api";
import type { Response } from "node-fetch";
import type { KubeObjectSpec, KubeObjectStatus } from "./kube-object";

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
  labels?: Record<string, string | undefined>;
  annotations?: Record<string, string | undefined>;
  [key: string]: any;
}

export interface KubeJsonApiData<
  Metadata extends KubeJsonApiMetadata = KubeJsonApiMetadata,
  Status extends KubeObjectStatus<any> = KubeObjectStatus,
  Spec extends KubeObjectSpec = KubeObjectSpec,
> extends JsonApiData {
  kind: string;
  apiVersion: string;
  metadata: Metadata;
  status?: Status;
  spec?: Spec;
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
  protected parseError(error: KubeJsonApiError | any, res: Response): string[] {
    const { status, reason, message } = error;

    if (status && reason) {
      return [message || `${status}: ${reason}`];
    }

    return super.parseError(error, res);
  }
}
