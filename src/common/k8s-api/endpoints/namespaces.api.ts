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

import { KubeApi } from "../kube-api";
import { KubeObject } from "../kube-object";
import { autoBind } from "../../../renderer/utils";
import { metricsApi } from "./metrics.api";
import type { IPodMetrics } from "./pods.api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export enum NamespaceStatus {
  ACTIVE = "Active",
  TERMINATING = "Terminating",
}

export interface Namespace {
  status?: {
    phase: string;
  };
}

export class Namespace extends KubeObject {
  static kind = "Namespace";
  static namespaced = false;
  static apiBase = "/api/v1/namespaces";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  getStatus() {
    return this.status?.phase ?? "-";
  }
}

export class NamespaceApi extends KubeApi<Namespace> {
}

export function getMetricsForNamespace(namespace: string, selector = ""): Promise<IPodMetrics> {
  const opts = { category: "pods", pods: ".*", namespace, selector };

  return metricsApi.getMetrics({
    cpuUsage: opts,
    memoryUsage: opts,
    fsUsage: opts,
    networkReceive: opts,
    networkTransmit: opts,
  }, {
    namespace,
  });
}

let namespacesApi: NamespaceApi;

if (isClusterPageContext()) {
  namespacesApi = new NamespaceApi({
    objectConstructor: Namespace,
  });
}

export {
  namespacesApi,
};
