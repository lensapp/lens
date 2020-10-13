import { observable, when } from "mobx";
import requestPromise from "request-promise-native";
import { ClusterMetaCollector, StopError } from "../cluster-meta-manager";
import { ClusterId, clusterStore } from "../cluster-store";

export class Distribution extends ClusterMetaCollector {
  private isCollecting = false

  shouldStop = when(() => this.isStopping);
  @observable isStopping = false


  constructor(
    protected clusterId: ClusterId,
    protected onSuccess: (result: any) => void,
    protected onError: (err: string) => void,
  ) {
    super()
  }

  promStopEarly<T>(prom: Promise<T>): Promise<T> {
    return Promise.race([
      prom,
      this.shouldStop.then(() => { throw new StopError() }),
    ])
  }

  // private detectDistribution() {
  //   if (kubernetesVersion.includes("gke")) return "gke"
  //   if (kubernetesVersion.includes("eks")) return "eks"
  //   if (kubernetesVersion.includes("IKS")) return "iks"
  //   if (this.apiUrl.endsWith("azmk8s.io")) return "aks"
  //   if (this.apiUrl.endsWith("k8s.ondigitalocean.com")) return "digitalocean"
  //   if (this.contextName.startsWith("minikube")) return "minikube"
  //   if (kubernetesVersion.includes("+")) return "custom"
  //   return "vanilla"
  // }

  async start(): Promise<void> {
    if (this.isCollecting) {
      return
    }

    try {
      this.isCollecting = true
      const cluster = clusterStore.getById(this.clusterId)
      const url = cluster.kubeProxyUrl + "/version"

      const res = await this.promStopEarly(requestPromise(url, {
        json: true,
        timeout: 30000,
        headers: {
          Host: `${this.clusterId}.${(new URL(cluster.kubeProxyUrl)).host}`
        }
      }))

    } catch (err) {
      if (err instanceof StopError) {
        return
      }

      this.onError(String(err))
    } finally {
      this.isStopping = false
      this.isCollecting = false
    }
  }

  stop(): void {
    if (!this.isCollecting) {
      return
    }

    this.isStopping = true
  }
}
