import { RequestPromiseOptions } from "request-promise-native";
import { Cluster } from "../cluster";
import { k8sRequest } from "../k8s-request";

export type ClusterDetectionResult = {
  value: string | number | boolean
  accuracy: number
};

export class BaseClusterDetector {
  key: string;

  constructor(public cluster: Cluster) {
  }

  detect(): Promise<ClusterDetectionResult> {
    return null;
  }

  protected async k8sRequest<T = any>(path: string, options: RequestPromiseOptions = {}): Promise<T> {
    return k8sRequest(this.cluster, path, options);
  }
}
