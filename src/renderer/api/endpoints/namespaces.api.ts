import { KubeApi } from "../kube-api";
import { KubeObject } from "../kube-object";
import { autobind } from "../../utils";
import { IResourceMetrics, metricsApi } from "./metrics.api";

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
  getMetrics(namespace: string, selector = ""): Promise<IResourceMetrics> {
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
}

export const namespacesApi = new NamespaceApi({
  objectConstructor: Namespace,
});
