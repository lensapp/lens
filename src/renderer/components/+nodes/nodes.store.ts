import { action, computed, observable } from "mobx"
import { clusterApi, IClusterMetrics, INodeMetrics, Node, nodesApi } from "../../api/endpoints";
import { autobind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { apiManager } from "../../api/api-manager";

@autobind()
export class NodesStore extends KubeObjectStore<Node> {
  api = nodesApi

  @observable metrics: Partial<INodeMetrics> = {};
  @observable nodeMetrics: Partial<IClusterMetrics> = null;
  @observable metricsLoading = false;
  @observable metricsLoaded = false;

  @action
  async loadUsageMetrics() {
    this.metricsLoading = true;
    try {
      this.metrics = await nodesApi.getMetrics();
      this.metricsLoaded = true;
    } finally {
      this.metricsLoading = false;
    }
  }

  @action
  async loadMetrics(nodeName: string) {
    this.nodeMetrics = await clusterApi.getMetrics([nodeName]);
  }

  @computed get masterNodes() {
    return this.items.filter(node => node.getRoleLabels().includes("master"))
  }

  @computed get workerNodes() {
    return this.items.filter(node => !node.getRoleLabels().includes("master"))
  }

  getLastMetricValues(node: Node, metricNames: string[]): number[] {
    if (!this.metricsLoaded) {
      return;
    }
    const nodeName = node.getName();
    return metricNames.map(metricName => {
      try {
        const metric = this.metrics[metricName];
        const result = metric.data.result.find(result => {
          return [
            result.metric.node,
            result.metric.instance,
            result.metric.kubernetes_node,
          ].includes(nodeName)
        });
        return result ? parseFloat(result.values.slice(-1)[0][1]) : 0;
      } catch (e) {
        return 0;
      }
    });
  }

  reset() {
    super.reset();
    this.metrics = {};
    this.nodeMetrics = null;
    this.metricsLoading = false;
    this.metricsLoaded = false;
  }
}

export const nodesStore = new NodesStore()
apiManager.registerStore(nodesStore);
