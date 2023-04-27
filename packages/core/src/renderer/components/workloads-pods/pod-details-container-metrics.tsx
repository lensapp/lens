/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import React from "react";
import type { Container, Pod } from "@k8slens/kube-object";
import { getItemMetrics } from "../../../common/k8s-api/endpoints/metrics.api";
import type { PodMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics.injectable";
import { ResourceMetrics } from "../resource-metrics";
import { ContainerCharts } from "./container-charts";
import podContainerMetricsInjectable from "./container-metrics.injectable";

interface ContainerMetricsProps {
  container: Container;
  pod: Pod;
}

interface Dependencies {
  podContainerMetrics: IAsyncComputed<PodMetricData>;
}

const NonInjectedPodDetailsContainerMetrics = observer(({ pod, container, podContainerMetrics }: ContainerMetricsProps & Dependencies) => {
  const metrics = getItemMetrics(toJS(podContainerMetrics.value.get()), container.name);

  if (!metrics) {
    return null;
  }

  return (
    <ResourceMetrics
      object={pod}
      tabs={[
        "CPU",
        "Memory",
        "Filesystem",
      ]}
      metrics={metrics}
    >
      <ContainerCharts />
    </ResourceMetrics>
  );
});

export const PodDetailsContainerMetrics = withInjectables<Dependencies, ContainerMetricsProps>(NonInjectedPodDetailsContainerMetrics, {
  getProps: (di, props) => ({
    ...props,
    podContainerMetrics: di.inject(podContainerMetricsInjectable, props.pod),
  }),
});
