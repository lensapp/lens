/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getFeature } from "@k8slens/feature-core";
import { clusterOverviewUIBlockInjectionToken, deploymentDetailsMetricsInjectionToken, nodeDetailsMetricsInjectionToken, persistentVolumeClaimDetailsMetricsInjectionToken, podDetailsContainerMetricsInjectionToken, podDetailsMetricsInjectionToken, replicaSetDetailsMetricsInjectionToken } from "@k8slens/metrics";
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterMetrics } from "../../renderer/components/+cluster/cluster-metrics";
import { ClusterPieCharts } from "../../renderer/components/+cluster/cluster-pie-charts";
import { NodeMetricsDetailsComponent } from "../../renderer/components/+nodes/metrics-details-component";
import { PersistentVolumeClaimMetricsDetailsComponent } from "../../renderer/components/+storage-volume-claims/metrics-details-component";
import { DeploymentMetricsDetailsComponent } from "../../renderer/components/+workloads-deployments/metrics-details-component";
import { PodDetailsContainerMetrics } from "../../renderer/components/+workloads-pods/pod-details-container-metrics";
import PodMetricsDetailsComponent from "../../renderer/components/+workloads-pods/pod-metrics-details-component";
import { ReplicaSetMetricsDetailsComponent } from "../../renderer/components/+workloads-replicasets/metrics-details-component";

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

const podDetailsMetricsInjectable = getInjectable({
  id: "pod-details-metrics-injectable",
  instantiate: () => ({
    id: "pod-details-metrics",
    Component: PodMetricsDetailsComponent,
  }),
  injectionToken: podDetailsMetricsInjectionToken,
});

const deploymentDetailsMetricsInjectable = getInjectable({
  id: "deployment-details-metrics-injectable",
  instantiate: () => ({
    id: "deployment-details-metrics",
    Component: DeploymentMetricsDetailsComponent,
  }),
  injectionToken: deploymentDetailsMetricsInjectionToken,
});

const podDetailsContainerMetricsInjectable = getInjectable({
  id: "pod-details-container-metrics-injectable",
  instantiate: () => ({
    id: "pod-details-container-metrics",
    Component: PodDetailsContainerMetrics,
  }),
  injectionToken: podDetailsContainerMetricsInjectionToken,
});

const nodeDetailsMetricsInjectable = getInjectable({
  id: "node-details-metrics-injectable",
  instantiate: () => ({
    id: "node-details-metrics",
    Component: NodeMetricsDetailsComponent,
  }),
  injectionToken: nodeDetailsMetricsInjectionToken,
});

const replicaSetDetailsMetricsInjectable = getInjectable({
  id: "replica-set-details-metrics-injectable",
  instantiate: () => ({
    id: "replica-set-details-metrics",
    Component: ReplicaSetMetricsDetailsComponent,
  }),
  injectionToken: replicaSetDetailsMetricsInjectionToken,
});

const persistentVolumeClaimDetailsMetricsInjectable = getInjectable({
  id: "persistent-volume-claim-details-metrics-injectable",
  instantiate: () => ({
    id: "persistent-volume-claim-details-metrics",
    Component: PersistentVolumeClaimMetricsDetailsComponent,
  }),
  injectionToken: persistentVolumeClaimDetailsMetricsInjectionToken,
});

export const metricsFeature = getFeature({
  id: "core-metrics-feature",

  register: (di) => {
    di.register(clusterPieChartsClusterOverviewInjectable);
    di.register(clusterMetricsOverviewBlockInjectable);

    di.register(podDetailsMetricsInjectable);
    di.register(podDetailsContainerMetricsInjectable);
    di.register(deploymentDetailsMetricsInjectable);
    di.register(nodeDetailsMetricsInjectable);
    di.register(replicaSetDetailsMetricsInjectable);
    di.register(persistentVolumeClaimDetailsMetricsInjectable);
  },
});
