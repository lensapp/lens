/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { BaseClusterDetector } from "./base-cluster-detector";
import { ClusterMetadataKey } from "../cluster";

export class DistributionDetector extends BaseClusterDetector {
  key = ClusterMetadataKey.DISTRIBUTION;
  version: string;

  public async detect() {
    this.version = await this.getKubernetesVersion();

    if (this.isRke()) {
      return { value: "rke", accuracy: 80};
    }

    if (this.isK3s()) {
      return { value: "k3s", accuracy: 80};
    }

    if (this.isGKE()) {
      return { value: "gke", accuracy: 80};
    }

    if (this.isEKS()) {
      return { value: "eks", accuracy: 80};
    }

    if (this.isIKS()) {
      return { value: "iks", accuracy: 80};
    }

    if (this.isAKS()) {
      return { value: "aks", accuracy: 80};
    }

    if (this.isDigitalOcean()) {
      return { value: "digitalocean", accuracy: 90};
    }

    if (this.isK0s()) {
      return { value: "k0s", accuracy: 80};
    }
    
    if (this.isVMWare()) {
      return { value: "vmware", accuracy: 90};
    }

    if (this.isMirantis()) {
      return { value: "mirantis", accuracy: 90};
    }

    if (this.isAlibaba()) {
      return { value: "alibaba", accuracy: 90};
    }

    if (this.isHuawei()) {
      return { value: "huawei", accuracy: 90};
    }

    if (this.isTke()) {
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

    if (this.isCustom() && await this.isOpenshift()) {
      return { value: "openshift", accuracy: 90};
    }

    if (this.isCustom()) {
      return { value: "custom", accuracy: 10};
    }

    return { value: "unknown", accuracy: 10};
  }

  public async getKubernetesVersion() {
    if (this.cluster.version) return this.cluster.version;

    const response = await this.k8sRequest("/version");

    return response.gitVersion;
  }

  protected isGKE() {
    return this.version.includes("gke");
  }

  protected isEKS() {
    return this.version.includes("eks");
  }

  protected isIKS() {
    return this.version.includes("IKS");
  }

  protected isAKS() {
    return this.cluster.apiUrl.includes("azmk8s.io");
  }

  protected isMirantis() {
    return this.version.includes("-mirantis-") || this.version.includes("-docker-");
  }

  protected isDigitalOcean() {
    return this.cluster.apiUrl.endsWith("k8s.ondigitalocean.com");
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

  protected isTke() {
    return this.version.includes("-tke.");
  }

  protected isCustom() {
    return this.version.includes("+");
  }

  protected isVMWare() {
    return this.version.includes("+vmware");
  }

  protected isRke() {
    return this.version.includes("-rancher");
  }

  protected isK3s() {
    return this.version.includes("+k3s");
  }

  protected isK0s() {
    return this.version.includes("-k0s");
  }
  
  protected isAlibaba() {
    return this.version.includes("-aliyun");
  }

  protected isHuawei() {
    return this.version.includes("-CCE");
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
