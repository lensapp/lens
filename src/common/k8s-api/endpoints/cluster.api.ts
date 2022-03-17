/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MetricData, IMetricsReqParams } from "./metrics.api";
import { metricsApi } from "./metrics.api";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export class ClusterApi extends KubeApi<Cluster> {
  static kind = "Cluster";
  static namespaced = true;
}

export function getMetricsByNodeNames(nodeNames: string[], params?: IMetricsReqParams): Promise<ClusterMetricData> {
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

export interface ClusterMetricData extends Partial<Record<string, MetricData>> {
  memoryUsage: MetricData;
  memoryRequests: MetricData;
  memoryLimits: MetricData;
  memoryCapacity: MetricData;
  cpuUsage: MetricData;
  cpuRequests: MetricData;
  cpuLimits: MetricData;
  cpuCapacity: MetricData;
  podUsage: MetricData;
  podCapacity: MetricData;
  fsSize: MetricData;
  fsUsage: MetricData;
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
