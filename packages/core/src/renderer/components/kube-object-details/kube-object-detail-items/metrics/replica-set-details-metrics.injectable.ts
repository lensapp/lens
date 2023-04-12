/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { replicaSetDetailsMetricsInjectionToken } from "@k8slens/metrics";
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterMetricsResourceType } from "../../../../../common/cluster-types";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { getMetricsKubeObjectDetailItemInjectable } from "./get-metrics-kube-object-detail-item.injectable";

const replicaSetMetricsInjectable = getInjectable({
  id: "replica-set-details-metrics",
  instantiate: (di) => {
    const getMetricsKubeObjectDetailItem = di.inject(getMetricsKubeObjectDetailItemInjectable);

    return getMetricsKubeObjectDetailItem(
      replicaSetDetailsMetricsInjectionToken,
      ClusterMetricsResourceType.ReplicaSet,
    );
  },
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default replicaSetMetricsInjectable;
