import { observable, reaction, when } from "mobx";
import { KubeObjectStore } from "../../kube-object.store";
import { Cluster, clusterApi, IClusterMetrics } from "../../api/endpoints";
import { autobind, createStorage } from "../../utils";
import { IMetricsReqParams, normalizeMetrics } from "../../api/endpoints/metrics.api";
import { nodesStore } from "../+nodes/nodes.store";
import { apiManager } from "../../api/api-manager";

export enum MetricType {
  MEMORY = "memory",
  CPU = "cpu"
}

export enum MetricNodeRole {
  MASTER = "master",
  WORKER = "worker"
}

@autobind()
export class ClusterStore extends KubeObjectStore<Cluster> {
  api = clusterApi

  @observable metrics: Partial<IClusterMetrics> = {};
  @observable liveMetrics: Partial<IClusterMetrics> = {};
  @observable metricsLoaded = false;
  @observable metricType: MetricType;
  @observable metricNodeRole: MetricNodeRole;

  constructor() {
    super();
    this.resetMetrics();

    // sync user setting with local storage
    const storage = createStorage("cluster_metric_switchers", {});
    Object.assign(this, storage.get());
    reaction(() => {
      const { metricType, metricNodeRole } = this;
      return { metricType, metricNodeRole }
    },
    settings => storage.set(settings)
    );

    // auto-update metrics
    reaction(() => this.metricNodeRole, () => {
      if (!this.metricsLoaded) return;
      this.metrics = {};
      this.liveMetrics = {};
      this.metricsLoaded = false;
      this.getAllMetrics();
    });

    // check which node type to select
    reaction(() => nodesStore.items.length, () => {
      const { masterNodes, workerNodes } = nodesStore;
      if (!masterNodes.length) this.metricNodeRole = MetricNodeRole.WORKER;
      if (!workerNodes.length) this.metricNodeRole = MetricNodeRole.MASTER;
    });
  }

  async loadMetrics(params?: IMetricsReqParams) {
    await when(() => nodesStore.isLoaded);
    const { masterNodes, workerNodes } = nodesStore;
    const nodes = this.metricNodeRole === MetricNodeRole.MASTER && masterNodes.length ? masterNodes : workerNodes;
    return clusterApi.getMetrics(nodes.map(node => node.getName()), params);
  }

  async getAllMetrics() {
    await this.getMetrics();
    await this.getLiveMetrics();
    this.metricsLoaded = true;
  }

  async getMetrics() {
    this.metrics = await this.loadMetrics();
  }

  async getLiveMetrics() {
    const step = 3;
    const range = 15;
    const end = Date.now() / 1000;
    const start = end - range;
    this.liveMetrics = await this.loadMetrics({ start, end, step, range });
  }

  getMetricsValues(source: Partial<IClusterMetrics>): [number, string][] {
    switch (this.metricType) {
    case MetricType.CPU:
      return normalizeMetrics(source.cpuUsage).data.result[0].values
    case MetricType.MEMORY:
      return normalizeMetrics(source.memoryUsage).data.result[0].values
    default:
      return [];
    }
  }

  resetMetrics() {
    this.metrics = {};
    this.metricsLoaded = false;
    this.metricType = MetricType.CPU;
    this.metricNodeRole = MetricNodeRole.WORKER;
  }

  reset() {
    super.reset();
    this.resetMetrics();
  }
}

export const clusterStore = new ClusterStore();
apiManager.registerStore(clusterStore);
