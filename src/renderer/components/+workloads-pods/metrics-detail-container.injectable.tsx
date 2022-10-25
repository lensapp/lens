/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { Pod } from "../../../common/k8s-api/endpoints";
import metricsDetailsComponentEnabledInjectable from "../../api/catalog/entity/metrics-details-component-enabled.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
import { ResourceMetrics } from "../resource-metrics";
import podMetricsInjectable from "./metrics.injectable";
import { PodCharts, podMetricTabs } from "./pod-charts";

const podMetricsDetailsComponentInjectable = getInjectable({
  id: "pod-metrics-details-container",
  instantiate: (di) => ({
    Component: ({ object }: KubeObjectDetailsProps<Pod>) => (
      <ResourceMetrics
        tabs={podMetricTabs}
        object={object}
        metrics={di.inject(podMetricsInjectable, object)}
      >
        <PodCharts />
      </ResourceMetrics>
    ),
    enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.Pod),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default podMetricsDetailsComponentInjectable;
