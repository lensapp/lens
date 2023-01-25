/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { type IAsyncComputed, withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { Job } from "../../../common/k8s-api/endpoints";
import type { JobPodMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics-for-jobs.injectable";
import metricsDetailsComponentEnabledInjectable from "../../api/catalog/entity/metrics-details-component-enabled.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
import { ResourceMetrics } from "../resource-metrics";
import jobMetricsInjectable from "./metrics.injectable";

interface Dependencies {
  metrics: IAsyncComputed<JobPodMetricData>;
}

const NonInjectedJobMetricsDetailsComponent = ({
  object,
  metrics,
}: KubeObjectDetailsProps<Job> & Dependencies) => (
  <ResourceMetrics
    tabs={podMetricTabs}
    object={object}
    metrics={metrics}
  >
    <PodCharts />
  </ResourceMetrics>
);

const JobMetricsDetailsComponent = withInjectables<Dependencies, KubeObjectDetailsProps<Job>>(NonInjectedJobMetricsDetailsComponent, {
  getProps: (di, props) => ({
    metrics: di.inject(jobMetricsInjectable, props.object),
    ...props,
  }),
});

const jobMetricsDetailsComponentInjectable = getInjectable({
  id: "job-metrics-details-component",
  instantiate: (di) => ({
    Component: JobMetricsDetailsComponent,
    enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.Job),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default jobMetricsDetailsComponentInjectable;
