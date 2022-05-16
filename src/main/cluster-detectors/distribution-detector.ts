/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BaseClusterDetector } from "./base-cluster-detector";
import { ClusterMetadataKey } from "../../common/cluster-types";

export class DistributionDetector extends BaseClusterDetector {
  key = ClusterMetadataKey.DISTRIBUTION;

  public async detect() {
    const version = await this.getKubernetesVersion();

    if (this.isRke(version)) {
      return { value: "rke", accuracy: 80 };
    }

    if (this.isRancherDesktop()) {
      return { value: "rancher-desktop", accuracy: 80 };
    }

    if (this.isK3s(version)) {
      return { value: "k3s", accuracy: 80 };
    }

    if (this.isGKE(version)) {
      return { value: "gke", accuracy: 80 };
    }

    if (this.isEKS(version)) {
      return { value: "eks", accuracy: 80 };
    }

    if (this.isIKS(version)) {
      return { value: "iks", accuracy: 80 };
    }

    if (this.isAKS()) {
      return { value: "aks", accuracy: 80 };
    }

    if (this.isDigitalOcean()) {
      return { value: "digitalocean", accuracy: 90 };
    }

    if (this.isK0s(version)) {
      return { value: "k0s", accuracy: 80 };
    }

    if (this.isVMWare(version)) {
      return { value: "vmware", accuracy: 90 };
    }

    if (this.isMirantis(version)) {
      return { value: "mirantis", accuracy: 90 };
    }

    if (this.isAlibaba(version)) {
      return { value: "alibaba", accuracy: 90 };
    }

    if (this.isHuawei(version)) {
      return { value: "huawei", accuracy: 90 };
    }

    if (this.isTke(version)) {
      return { value: "tencent", accuracy: 90 };
    }

    if (this.isMinikube()) {
      return { value: "minikube", accuracy: 80 };
    }

    if (this.isMicrok8s()) {
      return { value: "microk8s", accuracy: 80 };
    }

    if (this.isKind()) {
      return { value: "kind", accuracy: 70 };
    }

    if (this.isDockerDesktop()) {
      return { value: "docker-desktop", accuracy: 80 };
    }

    if (this.isCustom(version) && await this.isOpenshift()) {
      return { value: "openshift", accuracy: 90 };
    }

    if (this.isCustom(version)) {
      return { value: "custom", accuracy: 10 };
    }

    return { value: "unknown", accuracy: 10 };
  }

  public async getKubernetesVersion() {
    if (this.cluster.version) return this.cluster.version;

    const response = await this.k8sRequest("/version");

    return response.gitVersion;
  }

  protected isGKE(version: string) {
    return version.includes("gke");
  }

  protected isEKS(version: string) {
    return version.includes("eks");
  }

  protected isIKS(version: string) {
    return version.includes("IKS");
  }

  protected isAKS() {
    return this.cluster.apiUrl.includes("azmk8s.io");
  }

  protected isMirantis(version: string) {
    return version.includes("-mirantis-") || version.includes("-docker-");
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

  protected isTke(version: string) {
    return version.includes("-tke.");
  }

  protected isCustom(version: string) {
    return version.includes("+");
  }

  protected isVMWare(version: string) {
    return version.includes("+vmware");
  }

  protected isRke(version: string) {
    return version.includes("-rancher");
  }

  protected isRancherDesktop() {
    return this.cluster.contextName === "rancher-desktop";
  }

  protected isK3s(version: string) {
    return version.includes("+k3s");
  }

  protected isK0s(version: string) {
    return version.includes("-k0s") || version.includes("+k0s");
  }

  protected isAlibaba(version: string) {
    return version.includes("-aliyun");
  }

  protected isHuawei(version: string) {
    return version.includes("-CCE");
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
