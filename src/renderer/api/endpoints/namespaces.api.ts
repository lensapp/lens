import { KubeApi } from "../kube-api";
import { KubeObject } from "../kube-object";
import { autobind } from "../../utils";
import { metricsApi } from "./metrics.api";
import { IPodMetrics } from "./pods.api";

export enum NamespaceStatus {
  ACTIVE = "Active",
  TERMINATING = "Terminating",
}

@autobind()
export class Namespace extends KubeObject {
  static kind = "Namespace";
  static namespaced = false;
  static apiBase = "/api/v1/namespaces";

  status?: {
    phase: string;
  };

  getStatus() {
    return this.status ? this.status.phase : "-";
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

export const namespacesApi = new NamespaceApi({
  objectConstructor: Namespace,
});
