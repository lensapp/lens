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

import { sum } from "lodash";
import { action, computed, observable, makeObservable } from "mobx";
import { clusterApi, IClusterMetrics, INodeMetrics, Node, nodesApi } from "../../api/endpoints";
import { autoBind } from "../../utils";
import { KubeObjectStore } from "../../kube-object.store";
import { apiManager } from "../../api/api-manager";

export class NodesStore extends KubeObjectStore<Node> {
  api = nodesApi;

  @observable metrics: Partial<INodeMetrics> = {};
  @observable nodeMetrics: Partial<IClusterMetrics> = null;
  @observable metricsLoading = false;
  @observable metricsLoaded = false;

  constructor() {
    super();

    makeObservable(this);
    autoBind(this);
  }

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
    return this.items.filter(node => node.getRoleLabels().includes("master"));
  }

  @computed get workerNodes() {
    return this.items.filter(node => !node.getRoleLabels().includes("master"));
  }

  getLastMetricValues(node: Node, metricNames: string[]): number[] {
    if (!this.metricsLoaded) {
      return [];
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
          ].includes(nodeName);
        });

        return result ? parseFloat(result.values.slice(-1)[0][1]) : 0;
      } catch (e) {
        return 0;
      }
    });
  }

  getWarningsCount(): number {
    return sum(this.items.map((node: Node) => node.getWarningConditions().length));
  }

  reset() {
    super.reset();
    this.metrics = {};
    this.nodeMetrics = null;
    this.metricsLoading = false;
    this.metricsLoaded = false;
  }
}

export const nodesStore = new NodesStore();
apiManager.registerStore(nodesStore);
