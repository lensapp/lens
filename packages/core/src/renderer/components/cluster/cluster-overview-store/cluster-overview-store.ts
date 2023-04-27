/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, observable, reaction, when, makeObservable, runInAction } from "mobx";
import type { KubeObjectStoreDependencies } from "../../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import type { ClusterApi } from "../../../../common/k8s-api/endpoints";
import type { Cluster } from "@k8slens/kube-object";
import type { StorageLayer } from "../../../utils/storage-helper";
import type { NodeStore } from "../../nodes/store";
import type { ClusterMetricData, RequestClusterMetricsByNodeNames } from "../../../../common/k8s-api/endpoints/metrics.api/request-cluster-metrics-by-node-names.injectable";
import type { RequestMetricsParams } from "../../../../common/k8s-api/endpoints/metrics.api/request-metrics.injectable";
import { normalizeMetrics } from "../../../../common/k8s-api/endpoints/metrics.api";
import autoBind from "auto-bind";

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
  metricNodeRole: MetricNodeRole;
}

interface ClusterOverviewStoreDependencies extends KubeObjectStoreDependencies {
  readonly storage: StorageLayer<ClusterOverviewStorageState>;
  readonly nodeStore: NodeStore;
  requestClusterMetricsByNodeNames: RequestClusterMetricsByNodeNames;
}

export class ClusterOverviewStore extends KubeObjectStore<Cluster, ClusterApi> implements ClusterOverviewStorageState {
  @observable metrics: ClusterMetricData | undefined = undefined;

  get metricsLoaded() {
    return !!this.metrics;
  }

  get metricType(): MetricType {
    return this.dependencies.storage.get().metricType;
  }

  set metricType(value: MetricType) {
    this.dependencies.storage.merge({ metricType: value });
  }

  get metricNodeRole(): MetricNodeRole {
    return this.dependencies.storage.get().metricNodeRole;
  }

  set metricNodeRole(value: MetricNodeRole) {
    this.dependencies.storage.merge({ metricNodeRole: value });
  }

  constructor(protected readonly dependencies: ClusterOverviewStoreDependencies, api: ClusterApi) {
    super(dependencies, api);
    makeObservable(this);
    autoBind(this);

    this.init();
  }

  private init() {
    // TODO: refactor, seems not a correct place to be
    // auto-refresh metrics on user-action
    reaction(() => this.metricNodeRole, () => {
      if (this.metrics) {
        this.resetMetrics();
        void this.loadMetrics();
      }
    });

    // check which node type to select
    reaction(() => this.dependencies.nodeStore.items.length, () => {
      const { masterNodes, workerNodes } = this.dependencies.nodeStore;

      if (!masterNodes.length) this.metricNodeRole = MetricNodeRole.WORKER;
      if (!workerNodes.length) this.metricNodeRole = MetricNodeRole.MASTER;
    });
  }

  async loadMetrics(params?: RequestMetricsParams) {
    await when(() => this.dependencies.nodeStore.isLoaded);
    const { masterNodes, workerNodes } = this.dependencies.nodeStore;
    const nodes = this.metricNodeRole === MetricNodeRole.MASTER && masterNodes.length ? masterNodes : workerNodes;

    const metrics = await this.dependencies.requestClusterMetricsByNodeNames(nodes.map(node => node.getName()), params);

    runInAction(() => {
      this.metrics = metrics;
    });
  }

  getMetricsValues(source: Partial<ClusterMetricData>): [number, string][] {
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
    this.metrics = undefined;
  }

  reset() {
    super.reset();
    this.resetMetrics();
    this.dependencies.storage?.reset();
  }
}
