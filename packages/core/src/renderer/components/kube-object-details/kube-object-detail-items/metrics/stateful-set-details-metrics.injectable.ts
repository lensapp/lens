/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterMetricsResourceType } from "../../../../../common/cluster-types";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { statefulSetDetailsMetricsInjectionToken } from "@k8slens/metrics";
import { getMetricsKubeObjectDetailItemInjectable } from "./get-metrics-kube-object-detail-item.injectable";

const statefulSetMetricsInjectable = getInjectable({
  id: "stateful-set-details-metrics",
  instantiate: (di) => {
    const getMetricsKubeObjectDetailItem = di.inject(getMetricsKubeObjectDetailItemInjectable);

    return getMetricsKubeObjectDetailItem(
      statefulSetDetailsMetricsInjectionToken,
      ClusterMetricsResourceType.StatefulSet,
    );
  },
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default statefulSetMetricsInjectable;
