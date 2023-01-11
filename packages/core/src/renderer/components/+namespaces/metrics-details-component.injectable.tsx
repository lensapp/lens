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
import type { Namespace } from "../../../common/k8s-api/endpoints";
import type { PodMetricInNamespaceData } from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics-in-namespace.injectable";
import metricsDetailsComponentEnabledInjectable from "../../api/catalog/entity/metrics-details-component-enabled.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
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

const NamespaceMetricsDetailsComponent = withInjectables<Dependencies, KubeObjectDetailsProps<Namespace>>(NonInjectedNamespaceMetricsDetailsComponent, {
  getProps: (di, props) => ({
    metrics: di.inject(namespaceMetricsInjectable, props.object),
    ...props,
  }),
});

const namespaceMetricsDetailsComponentInjectable = getInjectable({
  id: "namespace-metrics-details-component",
  instantiate: (di) => ({
    Component: NamespaceMetricsDetailsComponent,
    enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.Namespace),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default namespaceMetricsDetailsComponentInjectable;
