/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getFeature } from "@k8slens/feature-core";
import { clusterOverviewUIBlockInjectionToken, podDetailsMetricsInjectionToken } from "@k8slens/metrics";
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterMetrics } from "../../renderer/components/+cluster/cluster-metrics";
import { ClusterPieCharts } from "../../renderer/components/+cluster/cluster-pie-charts";
import PodMetricsDetailsComponent from "../../renderer/components/+workloads-pods/pod-metrics-details-component";

const clusterPieChartsClusterOverviewInjectable = getInjectable({
  id: "cluster-pie-charts-cluster-overview",

  instantiate: () => ({
    id: "cluster-pie-charts-cluster-overview",
    Component: ClusterPieCharts,
    orderNumber: 2,
  }),

  injectionToken: clusterOverviewUIBlockInjectionToken,
});

const clusterMetricsOverviewBlockInjectable = getInjectable({
  id: "cluster-metrics-overview-block",

  instantiate: () => ({
    id: "cluster-metrics-overview-block",
    Component: ClusterMetrics,
    orderNumber: 1,
  }),

  injectionToken: clusterOverviewUIBlockInjectionToken,
});

const podMetricsDetailsComponentInjectable = getInjectable({
  id: "pod-metrics-details-component-injectable",
  instantiate: () => ({
    id: "pod-metrics-details-component-injectable",
    Component: PodMetricsDetailsComponent,
  }),
  injectionToken: podDetailsMetricsInjectionToken,
});

export const metricsFeature = getFeature({
  id: "core-metrics-feature",

  register: (di) => {
    di.register(clusterPieChartsClusterOverviewInjectable);
    di.register(clusterMetricsOverviewBlockInjectable);

    di.register(podMetricsDetailsComponentInjectable);
  },
});
