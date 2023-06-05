/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./cluster-overview.module.scss";

import React from "react";
import type { IComputedValue } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import type { NodeStore } from "../nodes/store";
import type { PodStore } from "../workloads-pods/store";
import { byOrderNumber } from "@k8slens/utilities";
import { TabLayout } from "../layout/tab-layout";
import { Spinner } from "@k8slens/spinner";
import { ClusterIssues } from "./cluster-issues";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { EventStore } from "../events/store";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import podStoreInjectable from "../workloads-pods/store.injectable";
import eventStoreInjectable from "../events/store.injectable";
import nodeStoreInjectable from "../nodes/store.injectable";
import enabledMetricsInjectable from "../../api/catalog/entity/metrics-enabled.injectable";
import type { ClusterOverviewUIBlock } from "@k8slens/metrics";
import { clusterOverviewUIBlockInjectionToken } from "@k8slens/metrics";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import type { ClusterMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-cluster-metrics-by-node-names.injectable";
import clusterOverviewMetricsInjectable from "./cluster-metrics.injectable";

interface Dependencies {
  subscribeStores: SubscribeStores;
  podStore: PodStore;
  eventStore: EventStore;
  nodeStore: NodeStore;
  clusterMetricsAreVisible: IComputedValue<boolean>;
  uiBlocks: IComputedValue<ClusterOverviewUIBlock[]>;
  clusterOverviewMetrics: IAsyncComputed<ClusterMetricData | undefined>;
}

@observer
class NonInjectedClusterOverview extends React.Component<Dependencies> {
  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.subscribeStores([
        this.props.podStore,
        this.props.eventStore,
        this.props.nodeStore,
      ]),
    ]);
  }

  renderWithMetrics() {
    return (
      <>
        {
          [...this.props.uiBlocks.get()]
            .sort(byOrderNumber)
            .map(block => <block.Component key={block.id}/>)
        }
        <ClusterIssues />
      </>
    );
  }

  render() {
    const { eventStore, nodeStore, clusterMetricsAreVisible } = this.props;
    const isMetricsHidden = !clusterMetricsAreVisible.get();

    return (
      <TabLayout scrollable>
        <div className={styles.ClusterOverview} data-testid="cluster-overview-page">
          {
            (!nodeStore.isLoaded || !eventStore.isLoaded)
              ? <Spinner center/>
              : (
                isMetricsHidden
                  ? <ClusterIssues className="OnlyClusterIssues"/>
                  : this.renderWithMetrics()
              )
          }
        </div>
      </TabLayout>
    );
  }
}

export const ClusterOverview = withInjectables<Dependencies>(NonInjectedClusterOverview, {
  getProps: (di) => ({
    subscribeStores: di.inject(subscribeStoresInjectable),
    clusterMetricsAreVisible: di.inject(enabledMetricsInjectable, ClusterMetricsResourceType.Cluster),
    podStore: di.inject(podStoreInjectable),
    eventStore: di.inject(eventStoreInjectable),
    nodeStore: di.inject(nodeStoreInjectable),
    uiBlocks: di.inject(computedInjectManyInjectable)(clusterOverviewUIBlockInjectionToken),
    clusterOverviewMetrics: di.inject(clusterOverviewMetricsInjectable),
  }),
});
