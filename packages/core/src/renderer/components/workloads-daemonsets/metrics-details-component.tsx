/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { PodCharts, podMetricTabs } from "../workloads-pods/pod-charts";
import type { DaemonSet } from "@k8slens/kube-object";
import type { DaemonSetPodMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics-for-daemon-sets.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
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

export const DaemonSetMetricsDetailsComponent = withInjectables<Dependencies, KubeObjectDetailsProps<DaemonSet>>(NonInjectedDaemonSetMetricsDetailsComponent, {
  getProps: (di, props) => ({
    metrics: di.inject(daemonSetMetricsInjectable, props.object),
    ...props,
  }),
});
