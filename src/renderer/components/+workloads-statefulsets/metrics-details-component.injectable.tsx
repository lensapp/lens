/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { type IAsyncComputed, withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { StatefulSet } from "../../../common/k8s-api/endpoints";
import type { StatefulSetPodMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics-for-stateful-sets.injectable";
import metricsDetailsComponentEnabledInjectable from "../../api/catalog/entity/metrics-details-component-enabled.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
import { ResourceMetrics } from "../resource-metrics";
import statefulSetMetricsInjectable from "./metrics.injectable";

interface Dependencies {
  metrics: IAsyncComputed<StatefulSetPodMetricData>;
}

const NonInjectedStatefulSetMetricsDetailsComponent = ({
  object,
  metrics,
}: KubeObjectDetailsProps<StatefulSet> & Dependencies) => (
  <ResourceMetrics
    tabs={podMetricTabs}
    object={object}
    metrics={metrics}
  >
    <PodCharts />
  </ResourceMetrics>
);

const StatefulSetMetricsDetailsComponent = withInjectables<Dependencies, KubeObjectDetailsProps<StatefulSet>>(NonInjectedStatefulSetMetricsDetailsComponent, {
  getProps: (di, props) => ({
    metrics: di.inject(statefulSetMetricsInjectable, props.object),
    ...props,
  }),
});

const statefulSetMetricsDetailsComponentInjectable = getInjectable({
  id: "stateful-set-metrics-details-component",
  instantiate: (di) => ({
    Component: StatefulSetMetricsDetailsComponent,
    enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.StatefulSet),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default statefulSetMetricsDetailsComponentInjectable;
