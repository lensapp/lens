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

import { IMetrics, IMetricsReqParams, metricsApi } from "./metrics.api";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export class ClusterApi extends KubeApi<Cluster> {
  static kind = "Cluster";
  static namespaced = true;
}

export function getMetricsByNodeNames(nodeNames: string[], params?: IMetricsReqParams): Promise<IClusterMetrics> {
  const nodes = nodeNames.join("|");
  const opts = { category: "cluster", nodes };

  return metricsApi.getMetrics({
    memoryUsage: opts,
    workloadMemoryUsage: opts,
    memoryRequests: opts,
    memoryLimits: opts,
    memoryCapacity: opts,
    memoryAllocatableCapacity: opts,
    cpuUsage: opts,
    cpuRequests: opts,
    cpuLimits: opts,
    cpuCapacity: opts,
    cpuAllocatableCapacity: opts,
    podUsage: opts,
    podCapacity: opts,
    podAllocatableCapacity: opts,
    fsSize: opts,
    fsUsage: opts,
  }, params);
}

export enum ClusterStatus {
  ACTIVE = "Active",
  CREATING = "Creating",
  REMOVING = "Removing",
  ERROR = "Error",
}

export interface IClusterMetrics<T = IMetrics> {
  [metric: string]: T;
  memoryUsage: T;
  memoryRequests: T;
  memoryLimits: T;
  memoryCapacity: T;
  cpuUsage: T;
  cpuRequests: T;
  cpuLimits: T;
  cpuCapacity: T;
  podUsage: T;
  podCapacity: T;
  fsSize: T;
  fsUsage: T;
}

export interface Cluster {
  spec: {
    clusterNetwork?: {
      serviceDomain?: string;
      pods?: {
        cidrBlocks?: string[];
      };
      services?: {
        cidrBlocks?: string[];
      };
    };
    providerSpec: {
      value: {
        profile: string;
      };
    };
  };
  status?: {
    apiEndpoints: {
      host: string;
      port: string;
    }[];
    providerStatus: {
      adminUser?: string;
      adminPassword?: string;
      kubeconfig?: string;
      processState?: string;
      lensAddress?: string;
    };
    errorMessage?: string;
    errorReason?: string;
  };
}

export class Cluster extends KubeObject {
  static kind = "Cluster";
  static apiBase = "/apis/cluster.k8s.io/v1alpha1/clusters";

  getStatus() {
    if (this.metadata.deletionTimestamp) return ClusterStatus.REMOVING;
    if (!this.status || !this.status) return ClusterStatus.CREATING;
    if (this.status.errorMessage) return ClusterStatus.ERROR;

    return ClusterStatus.ACTIVE;
  }
}

/**
 * Only available within kubernetes cluster pages
 */
let clusterApi: ClusterApi;

if (isClusterPageContext()) { // initialize automatically only when within a cluster iframe/context
  clusterApi = new ClusterApi({
    objectConstructor: Cluster,
  });
}

export {
  clusterApi,
};
