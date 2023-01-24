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
import type { Deployment } from "../../../common/k8s-api/endpoints";
import type { DeploymentPodMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics-for-deployments.injectable";
import metricsDetailsComponentEnabledInjectable from "../../api/catalog/entity/metrics-details-component-enabled.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
import { ResourceMetrics } from "../resource-metrics";
import deploymentMetricsInjectable from "./metrics.injectable";

interface Dependencies {
  metrics: IAsyncComputed<DeploymentPodMetricData>;
}

const NonInjectedDeploymentMetricsDetailsComponent = ({
  object,
  metrics,
}: KubeObjectDetailsProps<Deployment> & Dependencies) => (
  <ResourceMetrics
    tabs={podMetricTabs}
    object={object}
    metrics={metrics}
  >
    <PodCharts />
  </ResourceMetrics>
);

const DeploymentMetricsDetailsComponent = withInjectables<Dependencies, KubeObjectDetailsProps<Deployment>>(NonInjectedDeploymentMetricsDetailsComponent, {
  getProps: (di, props) => ({
    metrics: di.inject(deploymentMetricsInjectable, props.object),
    ...props,
  }),
});

const deploymentMetricsDetailsComponentInjectable = getInjectable({
  id: "deployment-metrics-details-component",
  instantiate: (di) => ({
    Component: DeploymentMetricsDetailsComponent,
    enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.Deployment),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default deploymentMetricsDetailsComponentInjectable;
