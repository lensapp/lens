import { BaseClusterDetector } from "./base-cluster-detector";
import { ClusterMetadataKey } from "../cluster";

export class DistributionDetector extends BaseClusterDetector {
  key = ClusterMetadataKey.DISTRIBUTION
  version: string

  public async detect() {
    this.version = await this.getKubernetesVersion()
    if (await this.isRancher()) {
      return { value: "rancher", accuracy: 80}
    }
    if (this.isGKE()) {
      return { value: "gke", accuracy: 80}
    }
    if (this.isEKS()) {
      return { value: "eks", accuracy: 80}
    }
    if (this.isIKS()) {
      return { value: "iks", accuracy: 80}
    }
    if (this.isAKS()) {
      return { value: "aks", accuracy: 80}
    }
    if (this.isDigitalOcean()) {
      return { value: "digitalocean", accuracy: 90}
    }
    if (this.isMinikube()) {
      return { value: "minikube", accuracy: 80}
    }
    if (this.isCustom()) {
      return { value: "custom", accuracy: 10}
    }
    return { value: "unknown", accuracy: 10}
  }

  public async getKubernetesVersion() {
    if (this.cluster.version) return this.cluster.version

    const response = await this.k8sRequest("/version")
    return response.gitVersion
  }

  protected isGKE() {
    return this.version.includes("gke")
  }

  protected isEKS() {
    return this.version.includes("eks")
  }

  protected isIKS() {
    return this.version.includes("IKS")
  }

  protected isAKS() {
    return this.cluster.apiUrl.endsWith("azmk8s.io")
  }

  protected isDigitalOcean() {
    return this.cluster.apiUrl.endsWith("k8s.ondigitalocean.com")
  }

  protected isMinikube() {
    return this.cluster.contextName.startsWith("minikube")
  }

  protected isCustom() {
    return this.version.includes("+")
  }

  protected async isRancher() {
    try {
      const response = await this.k8sRequest("")
      return response.data.find((api: any) => api?.apiVersion?.group === "meta.cattle.io") !== undefined
    } catch (e) {
      return false
    }
  }
}