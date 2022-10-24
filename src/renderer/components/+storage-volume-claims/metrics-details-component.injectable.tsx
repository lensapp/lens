/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import enabledMetricsInjectable from "../../api/catalog/entity/metrics-enabled.injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
import { ResourceMetrics } from "../resource-metrics";
import persistentVolumeClaimMetricsInjectable from "./metrics.injectable";
import { VolumeClaimDiskChart } from "./volume-claim-disk-chart";

const persistentVolumeClaimMetricsDetailsComponentInjectable = getInjectable({
  id: "persistent-volume-claim-metrics-details-component",
  instantiate: (di) => ({
    Component: ({ object }) => (
      <ResourceMetrics
        tabs={[
          "Disk",
        ]}
        object={object}
        metrics={di.inject(persistentVolumeClaimMetricsInjectable, object)}
      >
        <VolumeClaimDiskChart />
      </ResourceMetrics>
    ),
    enabled: di.inject(enabledMetricsInjectable, ClusterMetricsResourceType.VolumeClaim),
    orderNumber: -1,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default persistentVolumeClaimMetricsDetailsComponentInjectable;
