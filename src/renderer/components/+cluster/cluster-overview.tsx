import "./cluster-overview.scss";

import React from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";

import { eventStore } from "../+events/event.store";
import { nodesStore } from "../+nodes/nodes.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { getHostedCluster } from "../../../common/cluster-store";
import { isAllowedResource } from "../../../common/rbac";
import { KubeObjectStore } from "../../kube-object.store";
import { interval } from "../../utils";
import { TabLayout } from "../layout/tab-layout";
import { Spinner } from "../spinner";
import { ClusterIssues } from "./cluster-issues";
import { ClusterMetrics } from "./cluster-metrics";
import { clusterOverviewStore } from "./cluster-overview.store";
import { ClusterPieCharts } from "./cluster-pie-charts";

@observer
export class ClusterOverview extends React.Component {
  private stores: KubeObjectStore<any>[] = [];
  private subscribers: Array<() => void> = [];
  private metricPoller = interval(60, this.loadMetrics);

  @disposeOnUnmount
  fetchMetrics = reaction(
    () => clusterOverviewStore.metricNodeRole, // Toggle Master/Worker node switcher
    () => this.metricPoller.restart(true)
  );

  loadMetrics() {
    getHostedCluster().available && clusterOverviewStore.loadMetrics();
  }

  async componentDidMount() {
    if (isAllowedResource("nodes")) {
      this.stores.push(nodesStore);
    }

    if (isAllowedResource("pods")) {
      this.stores.push(podsStore);
    }

    if (isAllowedResource("events")) {
      this.stores.push(eventStore);
    }

    await Promise.all(this.stores.map(store => store.loadAll()));
    this.loadMetrics();

    this.subscribers = this.stores.map(store => store.subscribe());
    this.metricPoller.start();
  }

  componentWillUnmount() {
    this.subscribers.forEach(dispose => dispose()); // unsubscribe all
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
