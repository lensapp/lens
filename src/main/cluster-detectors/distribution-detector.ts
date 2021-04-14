import { BaseClusterDetector } from "./base-cluster-detector";
import { ClusterMetadataKey } from "../cluster";

function isGKE(version: string) {
  return version.includes("gke");
}

function isEKS(version: string) {
  return version.includes("eks");
}

function isIKS(version: string) {
  return version.includes("IKS");
}

function isMirantis(version: string) {
  return version.includes("-mirantis-") || version.includes("-docker-");
}

function isTke(version: string) {
  return version.includes("-tke.");
}

function isCustom(version: string) {
  return version.includes("+");
}

function isVMWare(version: string) {
  return version.includes("+vmware");
}

function isRke(version: string) {
  return version.includes("-rancher");
}

function isK3s(version: string) {
  return version.includes("+k3s");
}

function isK0s(version: string) {
  return version.includes("-k0s");
}

function isAlibaba(version: string) {
  return version.includes("-aliyun");
}

function isHuawei(version: string) {
  return version.includes("-CCE");
}

export class DistributionDetector extends BaseClusterDetector {
  key = ClusterMetadataKey.DISTRIBUTION;

  public async detect() {
    const version = await this.getKubernetesVersion();

    if (isRke(version)) {
      return { value: "rke", accuracy: 80};
    }

    if (isK3s(version)) {
      return { value: "k3s", accuracy: 80};
    }

    if (isGKE(version)) {
      return { value: "gke", accuracy: 80};
    }

    if (isEKS(version)) {
      return { value: "eks", accuracy: 80};
    }

    if (isIKS(version)) {
      return { value: "iks", accuracy: 80};
    }

    if (this.isAKS()) {
      return { value: "aks", accuracy: 80};
    }

    if (this.isDigitalOcean()) {
      return { value: "digitalocean", accuracy: 90};
    }

    if (isK0s(version)) {
      return { value: "k0s", accuracy: 80};
    }

    if (isVMWare(version)) {
      return { value: "vmware", accuracy: 90};
    }

    if (isMirantis(version)) {
      return { value: "mirantis", accuracy: 90};
    }

    if (isAlibaba(version)) {
      return { value: "alibaba", accuracy: 90};
    }

    if (isHuawei(version)) {
      return { value: "huawei", accuracy: 90};
    }

    if (isTke(version)) {
      return { value: "tencent", accuracy: 90};
    }

    if (this.isMinikube()) {
      return { value: "minikube", accuracy: 80};
    }

    if (this.isMicrok8s()) {
      return { value: "microk8s", accuracy: 80};
    }

    if (this.isKind()) {
      return { value: "kind", accuracy: 70};
    }

    if (this.isDockerDesktop()) {
      return { value: "docker-desktop", accuracy: 80};
    }

    if (isCustom(version)) {
      if (await this.isOpenshift()) {
        return { value: "openshift", accuracy: 90 };
      }

      return { value: "custom", accuracy: 10 };
    }

    return { value: "unknown", accuracy: 10};
  }

  public async getKubernetesVersion() {
    if (this.cluster.version) return this.cluster.version;

    const response = await this.k8sRequest("/version");

    return response.gitVersion;
  }

  protected isAKS() {
    return this.cluster.apiUrl?.includes("azmk8s.io");
  }

  protected isDigitalOcean() {
    return this.cluster.apiUrl?.endsWith("k8s.ondigitalocean.com");
  }

  protected isMinikube() {
    return this.cluster.contextName.startsWith("minikube");
  }

  protected isMicrok8s() {
    return this.cluster.contextName.startsWith("microk8s");
  }

  protected isKind() {
    return this.cluster.contextName.startsWith("kubernetes-admin@kind-");
  }

  protected isDockerDesktop() {
    return this.cluster.contextName === "docker-desktop";
  }

  protected async isOpenshift() {
    try {
      const response = await this.k8sRequest("");

      return response.paths?.includes("/apis/project.openshift.io");
    } catch (e) {
      return false;
    }
  }
}
