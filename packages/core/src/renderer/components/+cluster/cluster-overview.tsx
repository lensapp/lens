/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./cluster-overview.module.scss";

import React from "react";
import type { IComputedValue } from "mobx";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import type { NodeStore } from "../+nodes/store";
import type { PodStore } from "../+workloads-pods/store";
import { interval } from "@k8slens/utilities";
import { TabLayout } from "../layout/tab-layout";
import { Spinner } from "../spinner";
import { ClusterIssues } from "./cluster-issues";
import { ClusterMetrics } from "./cluster-metrics";
import type { ClusterOverviewStore } from "./cluster-overview-store/cluster-overview-store";
import { ClusterPieCharts } from "./cluster-pie-charts";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { EventStore } from "../+events/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterOverviewStoreInjectable from "./cluster-overview-store/cluster-overview-store.injectable";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import eventStoreInjectable from "../+events/store.injectable";
import nodeStoreInjectable from "../+nodes/store.injectable";
import enabledMetricsInjectable from "../../api/catalog/entity/metrics-enabled.injectable";

interface Dependencies {
  subscribeStores: SubscribeStores;
  clusterOverviewStore: ClusterOverviewStore;
  podStore: PodStore;
  eventStore: EventStore;
  nodeStore: NodeStore;
  clusterMetricsAreVisible: IComputedValue<boolean>;
}

@observer
class NonInjectedClusterOverview extends React.Component<Dependencies> {
  private readonly metricPoller = interval(60, async () => {
    try {
      await this.props.clusterOverviewStore.loadMetrics();
    } catch {
      // ignore
    }
  });

  componentDidMount() {
    this.metricPoller.start(true);

    disposeOnUnmount(this, [
      this.props.subscribeStores([
        this.props.podStore,
        this.props.eventStore,
        this.props.nodeStore,
      ]),

      reaction(
        () => this.props.clusterOverviewStore.metricNodeRole, // Toggle Master/Worker node switcher
        () => this.metricPoller.restart(true),
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
    const { eventStore, nodeStore, clusterMetricsAreVisible } = this.props;
    const isLoaded = nodeStore.isLoaded && eventStore.isLoaded;
    const isMetricsHidden = !clusterMetricsAreVisible.get();

    return (
      <TabLayout scrollable>
        <div className={styles.ClusterOverview} data-testid="cluster-overview-page">
          {this.renderClusterOverview(isLoaded, isMetricsHidden)}
        </div>
      </TabLayout>
    );
  }
}

export const ClusterOverview = withInjectables<Dependencies>(NonInjectedClusterOverview, {
  getProps: (di) => ({
    subscribeStores: di.inject(subscribeStoresInjectable),
    clusterOverviewStore: di.inject(clusterOverviewStoreInjectable),
    clusterMetricsAreVisible: di.inject(enabledMetricsInjectable, ClusterMetricsResourceType.Cluster),
    podStore: di.inject(podStoreInjectable),
    eventStore: di.inject(eventStoreInjectable),
    nodeStore: di.inject(nodeStoreInjectable),
  }),
});
