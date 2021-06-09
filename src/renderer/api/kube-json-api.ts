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

import { JsonApi, JsonApiData, JsonApiError } from "./json-api";

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
  protected parseError(error: KubeJsonApiError | any, res: Response): string[] {
    const { status, reason, message } = error;

    if (status && reason) {
      return [message || `${status}: ${reason}`];
    }

    return super.parseError(error, res);
  }
}
