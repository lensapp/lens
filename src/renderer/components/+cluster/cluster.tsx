import "./cluster.scss"

import React from "react";
import { computed, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { TabLayout } from "../layout/tab-layout";
import { ClusterIssues } from "./cluster-issues";
import { Spinner } from "../spinner";
import { cssNames, interval, isElectron } from "../../utils";
import { ClusterPieCharts } from "./cluster-pie-charts";
import { ClusterMetrics } from "./cluster-metrics";
import { nodesStore } from "../+nodes/nodes.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { clusterStore } from "./cluster.store";
import { eventStore } from "../+events/event.store";
import { isAllowedResource } from "../../../common/rbac";
import { getHostedCluster } from "../../../common/cluster-store";

@observer
export class Cluster extends React.Component {
  private dependentStores = [nodesStore, podsStore];

  private watchers = [
    interval(60, () => { getHostedCluster().available && clusterStore.getMetrics()}),
    interval(20, () => { getHostedCluster().available && eventStore.loadAll()})
  ];

  @computed get isLoaded() {
    return nodesStore.isLoaded && podsStore.isLoaded
  }

  // todo: refactor
  async componentDidMount() {
    const { dependentStores } = this;
    if (!isAllowedResource("nodes")) {
      dependentStores.splice(dependentStores.indexOf(nodesStore), 1)
    }
    this.watchers.forEach(watcher => watcher.start(true));

    await Promise.all([
      ...dependentStores.map(store => store.loadAll()),
      clusterStore.getAllMetrics()
    ]);

    disposeOnUnmount(this, [
      ...dependentStores.map(store => store.subscribe()),
      () => this.watchers.forEach(watcher => watcher.stop()),
      reaction(
        () => clusterStore.metricNodeRole,
        () => this.watchers.forEach(watcher => watcher.restart())
      )
    ])
  }

  render() {
    const { isLoaded } = this;
    return (
      <TabLayout>
        <div className="Cluster">
          {!isLoaded && <Spinner center/>}
          {isLoaded && (
            <>
              <ClusterMetrics/>
              <ClusterPieCharts/>
              <ClusterIssues className={cssNames({ wide: isElectron })}/>
            </>
          )}
        </div>
      </TabLayout>
    )
  }
}
