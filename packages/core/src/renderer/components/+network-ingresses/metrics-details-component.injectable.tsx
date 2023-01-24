/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { Ingress } from "../../../common/k8s-api/endpoints";
import type { IngressMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-ingress-metrics.injectable";
import metricsDetailsComponentEnabledInjectable from "../../api/catalog/entity/metrics-details-component-enabled.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
import { ResourceMetrics } from "../resource-metrics";
import { IngressCharts } from "./ingress-charts";
import ingressMetricsInjectable from "./metrics.injectable";

interface Dependencies {
  metrics: IAsyncComputed<IngressMetricData>;
}

const NonInjectedIngressMetricsDetailsComponent = ({
  object,
  metrics,
}: KubeObjectDetailsProps<Ingress> & Dependencies) => (
  <ResourceMetrics
    tabs={[
      "Network",
      "Duration",
    ]}
    object={object}
    metrics={metrics}
  >
    <IngressCharts />
  </ResourceMetrics>
);

const IngressMetricsDetailsComponent = withInjectables<Dependencies, KubeObjectDetailsProps<Ingress>>(NonInjectedIngressMetricsDetailsComponent, {
  getProps: (di, props) => ({
    metrics: di.inject(ingressMetricsInjectable, props.object),
    ...props,
  }),
});

const ingressMetricsDetailsComponentInjectable = getInjectable({
  id: "ingress-metrics-details-component",
  instantiate: (di) => ({
    Component: IngressMetricsDetailsComponent,
    enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.Ingress),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default ingressMetricsDetailsComponentInjectable;
