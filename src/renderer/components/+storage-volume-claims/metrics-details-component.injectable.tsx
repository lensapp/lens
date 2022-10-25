/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { PersistentVolumeClaim } from "../../../common/k8s-api/endpoints";
import type { PersistentVolumeClaimMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-persistent-volume-claim-metrics.injectable";
import metricsDetailsComponentEnabledInjectable from "../../api/catalog/entity/metrics-details-component-enabled.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
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

const PersistentVolumeClaimMetricsDetailsComponent = withInjectables<Dependencies, KubeObjectDetailsProps<PersistentVolumeClaim>>(NonInjectedPersistentVolumeClaimMetricsDetailsComponent, {
  getProps: (di, props) => ({
    metrics: di.inject(persistentVolumeClaimMetricsInjectable, props.object),
    ...props,
  }),
});

const persistentVolumeClaimMetricsDetailsComponentInjectable = getInjectable({
  id: "persistent-volume-claim-metrics-details-component",
  instantiate: (di) => ({
    Component: PersistentVolumeClaimMetricsDetailsComponent,
    enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.VolumeClaim),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default persistentVolumeClaimMetricsDetailsComponentInjectable;
