/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { type IAsyncComputed, withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { Pod } from "../../../common/k8s-api/endpoints";
import type { PodMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics.injectable";
import metricsDetailsComponentEnabledInjectable from "../../api/catalog/entity/metrics-details-component-enabled.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
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

const podMetricsDetailsComponentInjectable = getInjectable({
  id: "pod-metrics-details-container",
  instantiate: (di) => ({
    Component: PodMetricsDetailsComponent,
    enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.Pod),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default podMetricsDetailsComponentInjectable;
