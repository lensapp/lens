/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { Ingress } from "@k8slens/kube-object";
import type { IngressMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-ingress-metrics.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
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

export const IngressMetricsDetailsComponent = withInjectables<Dependencies, KubeObjectDetailsProps<Ingress>>(NonInjectedIngressMetricsDetailsComponent, {
  getProps: (di, props) => ({
    metrics: di.inject(ingressMetricsInjectable, props.object),
    ...props,
  }),
});
