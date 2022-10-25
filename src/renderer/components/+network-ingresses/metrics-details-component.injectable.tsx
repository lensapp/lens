/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { Ingress } from "../../../common/k8s-api/endpoints";
import metricsDetailsComponentEnabledInjectable from "../../api/catalog/entity/metrics-details-component-enabled.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
import { ResourceMetrics } from "../resource-metrics";
import { IngressCharts } from "./ingress-charts";
import ingressMetricsInjectable from "./metrics.injectable";

const ingressMetricsDetailsComponentInjectable = getInjectable({
  id: "ingress-metrics-details-component",
  instantiate: (di) => ({
    Component: ({ object }: KubeObjectDetailsProps<Ingress>) => (
      <ResourceMetrics
        tabs={ [
          "Network",
          "Duration",
        ] }
        object={ object }
        metrics={ di.inject(ingressMetricsInjectable, object) }
      >
        <IngressCharts />
      </ResourceMetrics>
    ),
    enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.Ingress),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default ingressMetricsDetailsComponentInjectable;
