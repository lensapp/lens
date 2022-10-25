/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { ReplicaSet } from "../../../common/k8s-api/endpoints";
import enabledMetricsInjectable from "../../api/catalog/entity/metrics-enabled.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
import { ResourceMetrics } from "../resource-metrics";
import replicaSetMetricsInjectable from "./metrics.injectable";

const replicaSetMetricsDetailsComponentInjectable = getInjectable({
  id: "replica-set-metrics-details-component",
  instantiate: (di) => ({
    Component: ({ object }: KubeObjectDetailsProps<ReplicaSet>) => (
      <ResourceMetrics
        tabs={podMetricTabs}
        object={object}
        metrics={di.inject(replicaSetMetricsInjectable, object)}
      >
        <PodCharts />
      </ResourceMetrics>
    ),
    enabled: di.inject(enabledMetricsInjectable, ClusterMetricsResourceType.ReplicaSet),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default replicaSetMetricsDetailsComponentInjectable;
