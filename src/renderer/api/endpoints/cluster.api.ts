import { IMetrics, IMetricsReqParams, metricsApi } from "./metrics.api";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

export class ClusterApi extends KubeApi<Cluster> {
  static kind = "Cluster"
  static namespaced = true

  async getMetrics(nodeNames: string[], params?: IMetricsReqParams): Promise<IClusterMetrics> {
    const nodes = nodeNames.join("|");
    const opts = { category: "cluster", nodes: nodes }

    return metricsApi.getMetrics({
      memoryUsage: opts,
      memoryRequests: opts,
      memoryLimits: opts,
      memoryCapacity: opts,
      cpuUsage: opts,
      cpuRequests: opts,
      cpuLimits: opts,
      cpuCapacity: opts,
      podUsage: opts,
      podCapacity: opts,
      fsSize: opts,
      fsUsage: opts
    }, params);
  }
}

export enum ClusterStatus {
  ACTIVE = "Active",
  CREATING = "Creating",
  REMOVING = "Removing",
  ERROR = "Error"
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

export class Cluster extends KubeObject {
  static kind = "Cluster";
  static apiBase = "/apis/cluster.k8s.io/v1alpha1/clusters"

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
  }
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
  }

  getStatus() {
    if (this.metadata.deletionTimestamp) return ClusterStatus.REMOVING;
    if (!this.status || !this.status) return ClusterStatus.CREATING;
    if (this.status.errorMessage) return ClusterStatus.ERROR;
    return ClusterStatus.ACTIVE;
  }
}

export const clusterApi = new ClusterApi({
  objectConstructor: Cluster,
});
