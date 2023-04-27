/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { type IAsyncComputed, withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { Pod } from "@k8slens/kube-object";
import type { PodMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { ResourceMetrics } from "../resource-metrics";
import podMetricsInjectable from "./metrics.injectable";
import { PodCharts, podMetricTabs } from "./pod-charts";

interface Dependencies {
  metrics: IAsyncComputed<PodMetricData>;
}

const NonInjectedPodMetricsDetailsComponent = ({
  object,
  metrics,
}: KubeObjectDetailsProps<Pod> & Dependencies) => (
  <ResourceMetrics
    tabs={podMetricTabs}
    object={object}
    metrics={metrics}
  >
    <PodCharts />
  </ResourceMetrics>
);

const PodMetricsDetailsComponent = withInjectables<Dependencies, KubeObjectDetailsProps<Pod>>(NonInjectedPodMetricsDetailsComponent, {
  getProps: (di, props) => ({
    metrics: di.inject(podMetricsInjectable, props.object),
    ...props,
  }),
});

export default PodMetricsDetailsComponent;
