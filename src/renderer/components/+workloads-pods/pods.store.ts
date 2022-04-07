/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import countBy from "lodash/countBy";
import { observable } from "mobx";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { cpuUnitsToNumber, isClusterPageContext, unitsToBytes } from "../../utils";
import type { Pod, PodMetrics, PodApi } from "../../../common/k8s-api/endpoints";
import { podMetricsApi, podApi } from "../../../common/k8s-api/endpoints";
import { apiManager } from "../../../common/k8s-api/api-manager";
import type { KubeObject, KubeObjectScope } from "../../../common/k8s-api/kube-object";

export class PodsStore extends KubeObjectStore<Pod, PodApi> {
  readonly kubeMetrics = observable.array<PodMetrics>([]);

  async loadKubeMetrics(namespace?: string) {
    try {
      const metrics = await podMetricsApi.list({ namespace });

      this.kubeMetrics.replace(metrics ?? []);
    } catch (error) {
      console.warn("loadKubeMetrics failed", error);
    }
  }

  getPodsByOwner(workload: KubeObject<unknown, unknown, KubeObjectScope.Namespace>): Pod[] {
    return this.items.filter(pod => (
      pod.getOwnerRefs()
        .find(owner => owner.uid === workload.getId())
    ));
  }

  getPodsByOwnerId(workloadId: string): Pod[] {
    return this.items.filter(pod => {
      return pod.getOwnerRefs().find(owner => owner.uid === workloadId);
    });
  }

  getPodsByNode(node: string) {
    if (!this.isLoaded) return [];

    return this.items.filter(pod => pod.spec.nodeName === node);
  }

  getStatuses(pods: Pod[]) {
    return countBy(pods.map(pod => pod.getStatus()).sort().reverse());
  }

  getPodKubeMetrics(pod: Pod) {
    const containers = pod.getContainers();
    const empty = { cpu: 0, memory: 0 };
    const metrics = this.kubeMetrics.find(metric => {
      return [
        metric.getName() === pod.getName(),
        metric.getNs() === pod.getNs(),
      ].every(v => v);
    });

    if (!metrics) return empty;

    return containers.reduce((total, container) => {
      const metric = metrics.containers.find(item => item.name == container.name);
      let cpu = "0";
      let memory = "0";

      if (metric && metric.usage) {
        cpu = metric.usage.cpu || "0";
        memory = metric.usage.memory || "0";
      }

      return {
        cpu: total.cpu + cpuUnitsToNumber(cpu),
        memory: total.memory + unitsToBytes(memory),
      };
    }, empty);
  }
}

export const podsStore = isClusterPageContext()
  ? new PodsStore(podApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(podsStore);
}
