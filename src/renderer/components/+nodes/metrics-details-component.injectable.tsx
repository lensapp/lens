/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { Node } from "../../../common/k8s-api/endpoints";
import metricsDetailsComponentEnabledInjectable from "../../api/catalog/entity/metrics-details-component-enabled.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
import { ResourceMetrics } from "../resource-metrics";
import nodeMetricsInjectable from "./metrics.injectable";
import { NodeCharts } from "./node-charts";

const nodeMetricsDetailsComponentInjectable = getInjectable({
  id: "node-metrics-details-component",
  instantiate: (di) => ({
    Component: ({ object }: KubeObjectDetailsProps<Node>) => (
      <ResourceMetrics
        tabs={ [
          "CPU",
          "Memory",
          "Disk",
          "Pods",
        ] }
        object={ object }
        metrics={ di.inject(nodeMetricsInjectable, object) }
      >
        <NodeCharts />
      </ResourceMetrics>
    ),
    enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.Node),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default nodeMetricsDetailsComponentInjectable;
