/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./overview.module.scss";

import React, { useEffect, useState } from "react";
import { when } from "mobx";
import { observer } from "mobx-react";
import { disposer, interval } from "../../utils";
import { TabLayout } from "../layout/tab-layout";
import { Spinner } from "../spinner";
import { ClusterIssues } from "./issues";
import { ClusterMetrics } from "./metrics";
import { ClusterPieCharts } from "./pie-charts";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { PodStore } from "../+pods/store";
import type { EventStore } from "../+events/store";
import type { NodeStore } from "../+nodes/store";
import podStoreInjectable from "../+pods/store.injectable";
import eventStoreInjectable from "../+events/store.injectable";
import nodeStoreInjectable from "../+nodes/store.injectable";
import { getMetricsByNodeNames, IClusterMetrics } from "../../../common/k8s-api/endpoints";
import { MetricNodeRole, MetricType } from "./overview.state";
import isMetricHiddenInjectable from "../../utils/is-metrics-hidden.injectable";
import type { KubeWatchApi } from "../../kube-watch-api/kube-watch-api";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";

export interface ClusterOverviewProps {
  clusterIsAvailable: boolean;
}

interface Dependencies {
  podStore: PodStore;
  eventStore: EventStore;
  nodeStore: NodeStore;
  isMetricHidden: boolean;
  kubeWatchApi: KubeWatchApi;
}

const NonInjectedClusterOverview = observer(({ kubeWatchApi, isMetricHidden, podStore, eventStore, nodeStore, clusterIsAvailable }: Dependencies & ClusterOverviewProps) => {
  const [metrics, setMetrics] = useState<IClusterMetrics | null>(null);
  const [metricsNodeRole, setMetricsNodeRole] = useState(MetricNodeRole.MASTER);
  const [metricsType, setMetricsType] = useState(MetricType.CPU);
  const [loadMetricsPoller] = useState(interval(60, async () => {
    if (!clusterIsAvailable) {
      return;
    }

    await when(() => nodeStore.isLoaded);

    const nodes = metricsNodeRole === MetricNodeRole.MASTER
      ? nodeStore.masterNodes
      : nodeStore.workerNodes;

    setMetrics(await getMetricsByNodeNames(nodes.map(node => node.getName())));
  }));

  useEffect(() => {
    loadMetricsPoller.start();

    return disposer(
      kubeWatchApi.subscribeStores([
        podStore,
        eventStore,
        nodeStore,
      ]),
      () => loadMetricsPoller.stop(),
    );
  }, []);

  const changeMetricsNodeRole = (val: MetricNodeRole) => {
    setMetricsNodeRole(val);
    loadMetricsPoller.restart(true);
  };

  const renderClusterOverview = () => (
    <>
      {!isMetricHidden && (
        <>
          <ClusterMetrics
            metrics={metrics}
            metricsType={metricsType}
            metricsNodeRole={metricsNodeRole}
            masterNodes={nodeStore.masterNodes}
            workerNodes={nodeStore.workerNodes}
            setMetricsType={setMetricsType}
            setMetricsNodeRole={changeMetricsNodeRole}
          />
          <ClusterPieCharts
            metrics={metrics}
            metricsNodeRole={metricsNodeRole}
            masterNodes={nodeStore.masterNodes}
            workerNodes={nodeStore.workerNodes}
          />
        </>
      )}
      <ClusterIssues className={isMetricHidden ? "OnlyClusterIssues" : ""} />
    </>
  );

  return (
    <TabLayout>
      <div className={styles.ClusterOverview} data-testid="cluster-overview-page">
        {
          (!nodeStore.isLoaded || !eventStore.isLoaded)
            ? <Spinner center/>
            : renderClusterOverview()
        }
      </div>
    </TabLayout>
  );
});

export const ClusterOverview = withInjectables<Dependencies, ClusterOverviewProps>(NonInjectedClusterOverview, {
  getProps: (di, props) => ({
    podStore: di.inject(podStoreInjectable),
    eventStore: di.inject(eventStoreInjectable),
    nodeStore: di.inject(nodeStoreInjectable),
    isMetricHidden: di.inject(isMetricHiddenInjectable, {
      metricType: ClusterMetricsResourceType.Cluster,
    }),
    kubeWatchApi: di.inject(kubeWatchApiInjectable),
    ...props,
  }),
});
