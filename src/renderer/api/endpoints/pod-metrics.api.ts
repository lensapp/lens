import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

export class PodMetrics extends KubeObject {
  static kind = "Pod"
  static namespaced = true
  static apiBase = "/apis/metrics.k8s.io/v1beta1/pods"

  timestamp: string
  window: string
  containers: {
    name: string;
    usage: {
      cpu: string;
      memory: string;
    };
  }[]
}

export const podMetricsApi = new KubeApi({
  objectConstructor: PodMetrics,
});
