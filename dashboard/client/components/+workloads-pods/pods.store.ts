import countBy from "lodash/countBy";
import { action, observable } from "mobx";
import { KubeObjectStore } from "../../kube-object.store";
import { autobind, cpuUnitsToNumber, unitsToBytes } from "../../utils";
import { PodMetricsData, Pod, podMetricsApi, podsApi } from "../../api/endpoints";
import { PodMetrics } from "../../api/endpoints/pod-metrics.api";
import { WorkloadKubeObject } from "../../api/workload-kube-object";
import { apiManager } from "../../api/api-manager";
import { Dictionary } from "lodash";
import { Metrics } from "client/api/endpoints/metrics.api";

export interface PodKubeMetrics {
  cpu: number;
  memory: number;
}

@autobind()
export class PodsStore extends KubeObjectStore<Pod> {
  api = podsApi;

  @observable metrics: PodMetricsData<Metrics> = null;
  @observable kubeMetrics = observable.array<PodMetrics>([]);

  @action
  async loadMetrics(pod: Pod): Promise<void> {
    this.metrics = await this.api.getMetrics([pod], pod.getNs());
  }

  loadContainerMetrics(pod: Pod): Promise<PodMetricsData<Metrics>> {
    return this.api.getMetrics([pod], pod.getNs(), "container, namespace");
  }

  async loadKubeMetrics(namespace?: string): Promise<void> {
    const metrics = await podMetricsApi.list({ namespace });
    this.kubeMetrics.replace(metrics);
  }

  getPodsByOwner(workload: WorkloadKubeObject): Pod[] {
    if (!workload) {
      return [];
    }
    return this.items.filter(pod => {
      const owners = pod.getOwnerRefs();
      if (!owners.length) {
        return;
      }
      return owners.find(owner => owner.uid === workload.getId());
    });
  }

  getPodsByNode(node: string): Pod[] {
    if (!this.isLoaded) {
      return [];
    }
    return this.items.filter(pod => pod.spec.nodeName === node);
  }

  getStatuses(pods: Pod[]): Dictionary<number> {
    return countBy(pods.map(pod => pod.getStatus()));
  }

  getPodKubeMetrics(pod: Pod): PodKubeMetrics {
    const containers = pod.spec.containers;
    const empty = { cpu: 0, memory: 0 };
    const metrics = this.kubeMetrics.find(metric => metric.getName() === pod.getName() && metric.getNs() === pod.getNs());
    if (!metrics) {
      return empty;
    }
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
        memory: total.memory + unitsToBytes(memory)
      };
    }, empty);
  }

  reset(): void {
    this.metrics = null;
  }
}

export const podsStore = new PodsStore();
apiManager.registerStore(podsApi, podsStore);
