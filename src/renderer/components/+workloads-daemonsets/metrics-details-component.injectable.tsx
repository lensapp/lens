/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { DaemonSet } from "../../../common/k8s-api/endpoints";
import type { DaemonSetPodMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics-for-daemon-sets.injectable";
import metricsDetailsComponentEnabledInjectable from "../../api/catalog/entity/metrics-details-component-enabled.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
import { ResourceMetrics } from "../resource-metrics";
import daemonSetMetricsInjectable from "./metrics.injectable";

interface Dependencies {
  metrics: IAsyncComputed<DaemonSetPodMetricData>;
}

const NonInjectedDaemonSetMetricsDetailsComponent = ({
  object,
  metrics,
}: KubeObjectDetailsProps<DaemonSet> & Dependencies) => (
  <ResourceMetrics
    tabs={podMetricTabs}
    object={object}
    metrics={metrics}
  >
    <PodCharts />
  </ResourceMetrics>
);

const DaemonSetMetricsDetailsComponent = withInjectables<Dependencies, KubeObjectDetailsProps<DaemonSet>>(NonInjectedDaemonSetMetricsDetailsComponent, {
  getProps: (di, props) => ({
    metrics: di.inject(daemonSetMetricsInjectable, props.object),
    ...props,
  }),
});

const daemonSetMetricsDetailsComponentInjectable = getInjectable({
  id: "daemon-set-metrics-details-component",
  instantiate: (di) => ({
    Component: DaemonSetMetricsDetailsComponent,
    enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.DaemonSet),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default daemonSetMetricsDetailsComponentInjectable;
