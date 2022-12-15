/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { type IAsyncComputed, withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { ReplicaSet } from "../../../common/k8s-api/endpoints";
import type { ReplicaSetPodMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics-for-replica-sets.injectable";
import metricsDetailsComponentEnabledInjectable from "../../api/catalog/entity/metrics-details-component-enabled.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
import { ResourceMetrics } from "../resource-metrics";
import replicaSetMetricsInjectable from "./metrics.injectable";

interface Dependencies {
  metrics: IAsyncComputed<ReplicaSetPodMetricData>;
}

const NonInjectedReplicaSetMetricsDetailsComponent = ({
  object,
  metrics,
}: KubeObjectDetailsProps<ReplicaSet> & Dependencies) => (
  <ResourceMetrics
    tabs={podMetricTabs}
    object={object}
    metrics={metrics}
  >
    <PodCharts />
  </ResourceMetrics>
);

const ReplicaSetMetricsDetailsComponent = withInjectables<Dependencies, KubeObjectDetailsProps<ReplicaSet>>(NonInjectedReplicaSetMetricsDetailsComponent, {
  getProps: (di, props) => ({
    metrics: di.inject(replicaSetMetricsInjectable, props.object),
    ...props,
  }),
});

const replicaSetMetricsDetailsComponentInjectable = getInjectable({
  id: "replica-set-metrics-details-component",
  instantiate: (di) => ({
    Component: ReplicaSetMetricsDetailsComponent,
    enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.ReplicaSet),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default replicaSetMetricsDetailsComponentInjectable;
