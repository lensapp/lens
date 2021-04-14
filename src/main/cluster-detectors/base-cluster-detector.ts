import { RequestPromiseOptions } from "request-promise-native";
import { Cluster, k8sRequest } from "../cluster";

export type ClusterDetectionResult = {
  value?: string | number | boolean
  accuracy: number
};

export abstract class BaseClusterDetector {
  abstract key: string;

  constructor(public cluster: Cluster) {}

  abstract detect(): Promise<ClusterDetectionResult | null>;

  protected async k8sRequest<T = any>(path: string, options: RequestPromiseOptions = {}): Promise<T> {
    return this.cluster[k8sRequest](path, options);
  }
}
