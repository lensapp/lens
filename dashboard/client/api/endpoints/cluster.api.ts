import { IMetrics, IMetricsReqParams, metricsApi } from "./metrics.api";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

export class ClusterApi extends KubeApi<Cluster> {
  async getMetrics(nodeNames: string[], params?: IMetricsReqParams): Promise<IClusterMetrics> {
    const nodes = nodeNames.join("|");
    const memoryUsage = `
        sum(
          node_memory_MemTotal_bytes - (node_memory_MemFree_bytes + node_memory_Buffers_bytes + node_memory_Cached_bytes)
        ) by (kubernetes_name)
      `.replace(/_bytes/g, `_bytes{kubernetes_node=~"${nodes}"}`);

    const memoryRequests = `sum(kube_pod_container_resource_requests{node=~"${nodes}", resource="memory"}) by (component)`;
    const memoryLimits = `sum(kube_pod_container_resource_limits{node=~"${nodes}", resource="memory"}) by (component)`;
    const memoryCapacity = `sum(kube_node_status_capacity{node=~"${nodes}", resource="memory"}) by (component)`;
    const cpuUsage = `sum(rate(node_cpu_seconds_total{kubernetes_node=~"${nodes}", mode=~"user|system"}[1m]))`;
    const cpuRequests = `sum(kube_pod_container_resource_requests{node=~"${nodes}", resource="cpu"}) by (component)`;
    const cpuLimits = `sum(kube_pod_container_resource_limits{node=~"${nodes}", resource="cpu"}) by (component)`;
    const cpuCapacity = `sum(kube_node_status_capacity{node=~"${nodes}", resource="cpu"}) by (component)`;
    const podUsage = `sum(kubelet_running_pod_count{instance=~"${nodes}"})`;
    const podCapacity = `sum(kube_node_status_capacity{node=~"${nodes}", resource="pods"}) by (component)`;
    const fsSize = `sum(node_filesystem_size_bytes{kubernetes_node=~"${nodes}", mountpoint="/"}) by (kubernetes_node)`;
    const fsUsage = `sum(node_filesystem_size_bytes{kubernetes_node=~"${nodes}", mountpoint="/"} - node_filesystem_avail_bytes{kubernetes_node=~"${nodes}", mountpoint="/"}) by (kubernetes_node)`;

    return metricsApi.getMetrics({
      memoryUsage,
      memoryRequests,
      memoryLimits,
      memoryCapacity,
      cpuUsage,
      cpuRequests,
      cpuLimits,
      cpuCapacity,
      podUsage,
      podCapacity,
      fsSize,
      fsUsage
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
  kind: Cluster.kind,
  apiBase: "/apis/cluster.k8s.io/v1alpha1/clusters",
  isNamespaced: true,
  objectConstructor: Cluster,
});
