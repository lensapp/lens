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

import { action, observable, reaction, when, makeObservable } from "mobx";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { Cluster, clusterApi, getMetricsByNodeNames, IClusterMetrics } from "../../../common/k8s-api/endpoints";
import { autoBind, createStorage } from "../../utils";
import { IMetricsReqParams, normalizeMetrics } from "../../../common/k8s-api/endpoints/metrics.api";
import { nodesStore } from "../+nodes/nodes.store";
import { apiManager } from "../../../common/k8s-api/api-manager";

export enum MetricType {
  MEMORY = "memory",
  CPU = "cpu",
}

export enum MetricNodeRole {
  MASTER = "master",
  WORKER = "worker",
}

export interface ClusterOverviewStorageState {
  metricType: MetricType;
  metricNodeRole: MetricNodeRole,
}

export class ClusterOverviewStore extends KubeObjectStore<Cluster> implements ClusterOverviewStorageState {
  api = clusterApi;

  @observable metrics: Partial<IClusterMetrics> = {};
  @observable metricsLoaded = false;

  private storage = createStorage<ClusterOverviewStorageState>("cluster_overview", {
    metricType: MetricType.CPU, // setup defaults
    metricNodeRole: MetricNodeRole.WORKER,
  });

  get metricType(): MetricType {
    return this.storage.get().metricType;
  }

  set metricType(value: MetricType) {
    this.storage.merge({ metricType: value });
  }

  get metricNodeRole(): MetricNodeRole {
    return this.storage.get().metricNodeRole;
  }

  set metricNodeRole(value: MetricNodeRole) {
    this.storage.merge({ metricNodeRole: value });
  }

  constructor() {
    super();
    makeObservable(this);
    autoBind(this);

    this.init();
  }

  private init() {
    // TODO: refactor, seems not a correct place to be
    // auto-refresh metrics on user-action
    reaction(() => this.metricNodeRole, () => {
      if (!this.metricsLoaded) return;
      this.resetMetrics();
      this.loadMetrics();
    });

    // check which node type to select
    reaction(() => nodesStore.items.length, () => {
      const { masterNodes, workerNodes } = nodesStore;

      if (!masterNodes.length) this.metricNodeRole = MetricNodeRole.WORKER;
      if (!workerNodes.length) this.metricNodeRole = MetricNodeRole.MASTER;
    });
  }

  @action
  async loadMetrics(params?: IMetricsReqParams) {
    await when(() => nodesStore.isLoaded);
    const { masterNodes, workerNodes } = nodesStore;
    const nodes = this.metricNodeRole === MetricNodeRole.MASTER && masterNodes.length ? masterNodes : workerNodes;

    this.metrics = await getMetricsByNodeNames(nodes.map(node => node.getName()), params);
    this.metricsLoaded = true;
  }

  getMetricsValues(source: Partial<IClusterMetrics>): [number, string][] {
    switch (this.metricType) {
      case MetricType.CPU:
        return normalizeMetrics(source.cpuUsage).data.result[0].values;
      case MetricType.MEMORY:
        return normalizeMetrics(source.memoryUsage).data.result[0].values;
      default:
        return [];
    }
  }

  @action
  resetMetrics() {
    this.metrics = {};
    this.metricsLoaded = false;
  }

  reset() {
    super.reset();
    this.resetMetrics();
    this.storage?.reset();
  }
}

export const clusterOverviewStore = new ClusterOverviewStore();
apiManager.registerStore(clusterOverviewStore);
