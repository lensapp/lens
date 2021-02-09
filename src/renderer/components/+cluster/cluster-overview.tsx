import "./cluster-overview.scss";

import React from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { nodesStore } from "../+nodes/nodes.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { getHostedCluster } from "../../../common/cluster-store";
import { interval } from "../../utils";
import { TabLayout } from "../layout/tab-layout";
import { Spinner } from "../spinner";
import { ClusterIssues } from "./cluster-issues";
import { ClusterMetrics } from "./cluster-metrics";
import { clusterOverviewStore } from "./cluster-overview.store";
import { ClusterPieCharts } from "./cluster-pie-charts";

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

  render() {
    const isLoaded = nodesStore.isLoaded && podsStore.isLoaded;

    return (
      <TabLayout>
        <div className="ClusterOverview">
          {!isLoaded ? <Spinner center/> : (
            <>
              <ClusterMetrics/>
              <ClusterPieCharts/>
              <ClusterIssues/>
            </>
          )}
        </div>
      </TabLayout>
    );
  }
}
