/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { PersistentVolumeClaim } from "@k8slens/kube-object";
import type { PersistentVolumeClaimMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-persistent-volume-claim-metrics.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { ResourceMetrics } from "../resource-metrics";
import persistentVolumeClaimMetricsInjectable from "./metrics.injectable";
import { VolumeClaimDiskChart } from "./volume-claim-disk-chart";

interface Dependencies {
  metrics: IAsyncComputed<PersistentVolumeClaimMetricData>;
}

const NonInjectedPersistentVolumeClaimMetricsDetailsComponent = ({
  object,
  metrics,
}: KubeObjectDetailsProps<PersistentVolumeClaim> & Dependencies) => (
  <ResourceMetrics
    tabs={[
      "Disk",
    ]}
    object={object}
    metrics={metrics}
  >
    <VolumeClaimDiskChart />
  </ResourceMetrics>
);

export const PersistentVolumeClaimMetricsDetailsComponent = withInjectables<Dependencies, KubeObjectDetailsProps<PersistentVolumeClaim>>(NonInjectedPersistentVolumeClaimMetricsDetailsComponent, {
  getProps: (di, props) => ({
    metrics: di.inject(persistentVolumeClaimMetricsInjectable, props.object),
    ...props,
  }),
});
