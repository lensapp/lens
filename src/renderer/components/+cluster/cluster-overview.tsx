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
import { createStorage, getHostedClusterId, interval } from "../../utils";
import { TabLayout } from "../layout/tab-layout";
import { Spinner } from "../spinner";
import { ClusterIssues } from "./cluster-issues";
import { ClusterMetrics } from "./cluster-metrics";
import { kubeClusterStore } from "./cluster-overview.store";
import { ClusterPieCharts } from "./cluster-pie-charts";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { ClusterStore } from "../../../common/cluster-store";
import type { IClusterMetrics } from "../../../common/k8s-api/endpoints";

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
});

@observer
export class ClusterOverview extends React.Component {
  @observable metrics?: IClusterMetrics = undefined;
  private metricPoller = interval(60, () => this.loadMetrics());

  loadMetrics() {
    const cluster = ClusterStore.getInstance().getById(getHostedClusterId());

    if (cluster.available) {
      kubeClusterStore.loadMetrics();
    }
  }
  async loadMetrics() {
    const { object: pod } = this.props;

    this.metrics = await getMetricsForPods([pod], pod.getNs());
    this.containerMetrics = await getMetricsForPods([pod], pod.getNs(), "container, namespace");
  }

  componentDidMount() {
    this.metricPoller.start(true);

    disposeOnUnmount(this, [
      reaction(
        () => kubeClusterStore.metricNodeRole, // Toggle Master/Worker node switcher
        () => this.metricPoller.restart(true)
      ),
    ]);
  }

  componentWillUnmount() {
    this.metricPoller.stop();
  }

  renderMetrics(isMetricsHidden: boolean) {
    if (isMetricsHidden) {
      return null;
    }

    return (
      <>
        <ClusterMetrics/>
        <ClusterPieCharts/>
      </>
    );
  }

  renderClusterOverview(isLoaded: boolean, isMetricsHidden: boolean) {
    if (!isLoaded) {
      return <Spinner center/>;
    }

    return (
      <>
        {this.renderMetrics(isMetricsHidden)}
        <ClusterIssues className={isMetricsHidden ? "OnlyClusterIssues" : ""}/>
      </>
    );
  }

  render() {
    const isLoaded = nodesStore.isLoaded && podsStore.isLoaded;
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Cluster);

    return (
      <TabLayout>
        <div className="ClusterOverview">
          {this.renderClusterOverview(isLoaded, isMetricHidden)}
        </div>
      </TabLayout>
    );
  }
}
