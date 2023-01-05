/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { Node } from "../../../common/k8s-api/endpoints";
import type { ClusterMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-cluster-metrics-by-node-names.injectable";
import metricsDetailsComponentEnabledInjectable from "../../api/catalog/entity/metrics-details-component-enabled.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
import { ResourceMetrics } from "../resource-metrics";
import nodeMetricsInjectable from "./metrics.injectable";
import { NodeCharts } from "./node-charts";

interface Dependencies {
  metrics: IAsyncComputed<ClusterMetricData>;
}

const NonInjectedNodeMetricsDetailsComponent = ({
  object,
  metrics,
}: KubeObjectDetailsProps<Node> & Dependencies) => (
  <ResourceMetrics
    tabs={[
      "CPU",
      "Memory",
      "Disk",
      "Pods",
    ]}
    object={object}
    metrics={metrics}
  >
    <NodeCharts />
  </ResourceMetrics>
);

const NodeMetricsDetailsComponent = withInjectables<Dependencies, KubeObjectDetailsProps<Node>>(NonInjectedNodeMetricsDetailsComponent, {
  getProps: (di, props) => ({
    metrics: di.inject(nodeMetricsInjectable, props.object),
    ...props,
  }),
});

const nodeMetricsDetailsComponentInjectable = getInjectable({
  id: "node-metrics-details-component",
  instantiate: (di) => ({
    Component: NodeMetricsDetailsComponent,
    enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.Node),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default nodeMetricsDetailsComponentInjectable;
