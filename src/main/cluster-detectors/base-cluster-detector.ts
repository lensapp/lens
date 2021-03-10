import { OptionsOfJSONResponseBody, Response } from "got";
import { Cluster, k8sRequest } from "../cluster";

export type ClusterDetectionResult = {
  value: string | number | boolean
  accuracy: number
};

export class BaseClusterDetector {
  cluster: Cluster;
  key: string;

  constructor(cluster: Cluster) {
    this.cluster = cluster;
  }

  detect(): Promise<ClusterDetectionResult> {
    return null;
  }

  protected async k8sRequest<T>(path: string, options: OptionsOfJSONResponseBody = {}): Promise<[Response<T>, T]> {
    options.headers ??= {};
    options.headers["Host"] ??= `${this.cluster.id}.${this.cluster.kubeProxyUrl.host}`; // required in ClusterManager.getClusterForRequest()''

    return k8sRequest(this.cluster.getUrlTo(path), options);
  }
}
