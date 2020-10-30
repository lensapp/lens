import request, { RequestPromiseOptions } from "request-promise-native"
import { Cluster } from "../cluster";

export type ClusterDetectionResult = {
  value: string | number | boolean
  accuracy: number
}

export class BaseClusterDetector {
  cluster: Cluster
  key: string

  constructor(cluster: Cluster) {
    this.cluster = cluster
  }

  detect(): Promise<ClusterDetectionResult> {
    return null
  }

  protected async k8sRequest<T = any>(path: string, options: RequestPromiseOptions = {}): Promise<T> {
    const apiUrl = this.cluster.kubeProxyUrl + path;
    return request(apiUrl, {
      json: true,
      timeout: 30000,
      ...options,
      headers: {
        Host: `${this.cluster.id}.${new URL(this.cluster.kubeProxyUrl).host}`, // required in ClusterManager.getClusterForRequest()
        ...(options.headers || {}),
      },
    })
  }
}