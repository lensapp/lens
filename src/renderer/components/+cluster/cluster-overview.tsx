import "./cluster-overview.scss";

import React from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { nodesStore } from "../+nodes/nodes.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { clusterStore, getHostedCluster } from "../../../common/cluster-store";
import { interval } from "../../utils";
import { TabLayout } from "../layout/tab-layout";
import { Spinner } from "../spinner";
import { ClusterIssues } from "./cluster-issues";
import { ClusterMetrics } from "./cluster-metrics";
import { clusterOverviewStore } from "./cluster-overview.store";
import { ClusterPieCharts } from "./cluster-pie-charts";
import { ResourceType } from "../cluster-settings/components/cluster-metrics-setting";

@observer
export class ClusterOverview extends React.Component {
  private metricPoller = interval(60, () => this.loadMetrics());

  loadMetrics() {
    getHostedCluster().available && clusterOverviewStore.loadMetrics();
  }

  componentDidMount() {
    this.metricPoller.start(true);

    disposeOnUnmount(this, [
      reaction(
        () => clusterOverviewStore.metricNodeRole, // Toggle Master/Worker node switcher
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
    const isMetricsHidden = clusterStore.isMetricHidden(ResourceType.Cluster);

    return (
      <TabLayout>
        <div className="ClusterOverview">
          {this.renderClusterOverview(isLoaded, isMetricsHidden)}
        </div>
      </TabLayout>
    );
  }
}
