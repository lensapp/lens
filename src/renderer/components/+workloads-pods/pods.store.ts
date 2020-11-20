import countBy from "lodash/countBy";
import { action, observable } from "mobx";
import { KubeObjectStore } from "../../kube-object.store";
import { autobind, cpuUnitsToNumber, unitsToBytes } from "../../utils";
import { IPodMetrics, Pod, PodMetrics, podMetricsApi, podsApi } from "../../api/endpoints";
import { WorkloadKubeObject } from "../../api/workload-kube-object";
import { apiManager } from "../../api/api-manager";

@autobind()
export class PodsStore extends KubeObjectStore<Pod> {
  api = podsApi;

  @observable metrics: IPodMetrics = null;
  @observable kubeMetrics = observable.array<PodMetrics>([]);

  @action
  async loadMetrics(pod: Pod) {
    this.metrics = await podsApi.getMetrics([pod], pod.getNs());
  }

  loadContainerMetrics(pod: Pod) {
    return podsApi.getMetrics([pod], pod.getNs(), "container, namespace");
  }

  async loadKubeMetrics(namespace?: string) {
    const metrics = await podMetricsApi.list({ namespace });
    this.kubeMetrics.replace(metrics);
  }

  getPodsByOwner(workload: WorkloadKubeObject): Pod[] {
    if (!workload) return [];
    return this.items.filter(pod => {
      const owners = pod.getOwnerRefs()
      if (!owners.length) return
      return owners.find(owner => owner.uid === workload.getId())
    })
  }

  getPodsByNode(node: string) {
    if (!this.isLoaded) return []
    return this.items.filter(pod => pod.spec.nodeName === node)
  }

  getStatuses(pods: Pod[]) {
    return countBy(pods.map(pod => pod.getStatus()))
  }

  getPodKubeMetrics(pod: Pod) {
    const containers = pod.getContainers();
    const empty = { cpu: 0, memory: 0 };
    const metrics = this.kubeMetrics.find(metric => {
      return [
        metric.getName() === pod.getName(),
        metric.getNs() === pod.getNs()
      ].every(v => v);
    });
    if (!metrics) return empty;
    return containers.reduce((total, container) => {
      const metric = metrics.containers.find(item => item.name == container.name);
      let cpu = "0"
      let memory = "0"
      if (metric && metric.usage) {
        cpu = metric.usage.cpu || "0"
        memory = metric.usage.memory || "0"
      }
      return {
        cpu: total.cpu + cpuUnitsToNumber(cpu),
        memory: total.memory + unitsToBytes(memory)
      }
    }, empty);
  }

  reset() {
    this.metrics = null;
  }
}

export const podsStore = new PodsStore();
apiManager.registerStore(podsStore);
