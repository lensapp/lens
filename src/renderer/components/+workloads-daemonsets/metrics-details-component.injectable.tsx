/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { DaemonSet } from "../../../common/k8s-api/endpoints";
import metricsDetailsComponentEnabledInjectable from "../../api/catalog/entity/metrics-details-component-enabled.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
import { ResourceMetrics } from "../resource-metrics";
import daemonSetMetricsInjectable from "./metrics.injectable";

const daemonSetMetricsDetailsComponentInjectable = getInjectable({
  id: "daemon-set-metrics-details-component",
  instantiate: (di) => ({
    Component: ({ object }: KubeObjectDetailsProps<DaemonSet>) => (
      <ResourceMetrics
        tabs={podMetricTabs}
        object={object}
        metrics={di.inject(daemonSetMetricsInjectable, object)}
      >
        <PodCharts />
      </ResourceMetrics>
    ),
    enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.DaemonSet),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default daemonSetMetricsDetailsComponentInjectable;
