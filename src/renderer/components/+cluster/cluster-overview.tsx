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

import "./cluster-overview.scss";

import React from "react";
import { observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { nodesStore } from "../+nodes/nodes.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { boundMethod, createStorage, interval } from "../../utils";
import { TabLayout } from "../layout/tab-layout";
import { Spinner } from "../spinner";
import { ClusterIssues } from "./cluster-issues";
import { ClusterMetrics } from "./cluster-metrics";
import { kubeClusterStore } from "./cluster-overview.store";
import { ClusterPieCharts } from "./cluster-pie-charts";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { getMetricsByNodeNames, IClusterMetrics, Node } from "../../../common/k8s-api/endpoints";
import type { IMetricsReqParams } from "../../../common/k8s-api/endpoints/metrics.api";
import { ResourceMetrics } from "../resource-metrics";

export enum MetricType {
  MEMORY = "memory",
  CPU = "cpu"
}

export enum MetricNodeRole {
  MASTER = "master",
  WORKER = "worker"
}

const storage = createStorage("cluster_overview", {
  metricType: MetricType.CPU, // setup defaults
  metricNodeRole: MetricNodeRole.WORKER,
  showVirtualNodes: false,
});

@observer
export class ClusterOverview extends React.Component {
  @observable metrics?: IClusterMetrics = undefined;

  get metricNodeRole() {
    return storage.get().metricNodeRole;
  }

  get showVirtualNodes() {
    return storage.get().showVirtualNodes;
  }

  getNodesForMetrics(): Node[] {
    const { masterNodes, workerNodes } = nodesStore;
    const nodes = this.metricNodeRole === MetricNodeRole.MASTER
      ? masterNodes
      : workerNodes;

    if (this.showVirtualNodes) {
      return nodes;
    }

    return nodes.filter(node => node.metadata.labels?.kind !== "virtual-kubelet");
  }

  @boundMethod
  async loadMetrics(params?: IMetricsReqParams): Promise<void> {
    const nodesNames = this.getNodesForMetrics().map(node => node.getName());

    this.metrics = await getMetricsByNodeNames(nodesNames, params);
  }

  render() {
    const { metrics } = this;
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Cluster);

    return (
      <TabLayout>
        <div className="ClusterOverview">
          {!isMetricHidden && (
            <ResourceMetrics
              loader={this.loadMetrics}
              tabs={[MetricType.CPU, MetricType.MEMORY]}
              params={{ metrics }}
            >
              <ClusterMetrics />
              <ClusterPieCharts />
            </ResourceMetrics>
          )}
          <ClusterIssues className={isMetricHidden ? "OnlyClusterIssues" : ""} />
        </div>
      </TabLayout>
    );
  }
}
