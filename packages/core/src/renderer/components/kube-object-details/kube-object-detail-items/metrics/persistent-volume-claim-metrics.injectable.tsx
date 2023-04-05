/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { persistentVolumeClaimDetailsMetricsInjectionToken } from "@k8slens/metrics";
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterMetricsResourceType } from "../../../../../common/cluster-types";
import metricsDetailsComponentEnabledInjectable from "../../../../api/catalog/entity/metrics-details-component-enabled.injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { EmptyMetrics } from "./empty-metrics";

const persistentVolumeClaimMetricsInjectable = getInjectable({
  id: "persistent-volume-claim-details-metrics",
  instantiate: (di) => {
    const persistentVolumeClaimMetrics = di.injectMany(persistentVolumeClaimDetailsMetricsInjectionToken);
    const first = persistentVolumeClaimMetrics[0];

    const Component = first?.Component ?? EmptyMetrics;

    return {
      Component,
      enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.VolumeClaim),
      orderNumber: -1,
    };
  },
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default persistentVolumeClaimMetricsInjectable;
