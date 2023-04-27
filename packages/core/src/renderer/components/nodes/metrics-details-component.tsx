/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { Node } from "@k8slens/kube-object";
import type { ClusterMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-cluster-metrics-by-node-names.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
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

export const NodeMetricsDetailsComponent = withInjectables<Dependencies, KubeObjectDetailsProps<Node>>(NonInjectedNodeMetricsDetailsComponent, {
  getProps: (di, props) => ({
    metrics: di.inject(nodeMetricsInjectable, props.object),
    ...props,
  }),
});
