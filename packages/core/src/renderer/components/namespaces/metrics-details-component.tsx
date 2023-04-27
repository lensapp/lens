/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { PodCharts, podMetricTabs } from "../workloads-pods/pod-charts";
import type { Namespace } from "@k8slens/kube-object";
import type { PodMetricInNamespaceData } from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics-in-namespace.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { ResourceMetrics } from "../resource-metrics";
import namespaceMetricsInjectable from "./metrics.injectable";

interface Dependencies {
  metrics: IAsyncComputed<PodMetricInNamespaceData>;
}

const NonInjectedNamespaceMetricsDetailsComponent = ({
  object,
  metrics,
}: KubeObjectDetailsProps<Namespace> & Dependencies) => (
  <ResourceMetrics
    tabs={podMetricTabs}
    object={object}
    metrics={metrics}
  >
    <PodCharts />
  </ResourceMetrics>
);

export const NamespaceMetricsDetailsComponent = withInjectables<Dependencies, KubeObjectDetailsProps<Namespace>>(NonInjectedNamespaceMetricsDetailsComponent, {
  getProps: (di, props) => ({
    metrics: di.inject(namespaceMetricsInjectable, props.object),
    ...props,
  }),
});
