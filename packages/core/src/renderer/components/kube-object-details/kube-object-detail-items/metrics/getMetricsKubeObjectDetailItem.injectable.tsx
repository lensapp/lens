/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeObjectDetailMetrics } from "@k8slens/metrics";
import type { InjectionToken } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterMetricsResourceType } from "../../../../../common/cluster-types";
import metricsDetailsComponentEnabledInjectable from "../../../../api/catalog/entity/metrics-details-component-enabled.injectable";
import type { KubeObjectDetailItem } from "../kube-object-detail-item-injection-token";
import { EmptyMetrics } from "./empty-metrics";

type GetMetricsKubeObjectDetailItem = (token: InjectionToken<KubeObjectDetailMetrics, void>, metricResourceType: ClusterMetricsResourceType) => KubeObjectDetailItem;

export const getMetricsKubeObjectDetailItemInjectable = getInjectable({
  id: "get-metrics-kube-object-detail-item",
  instantiate: (di) : GetMetricsKubeObjectDetailItem => (token, metricResourceType) => {
    const metrics = di.injectMany(token);
    const first = metrics[0];

    const Component = first?.Component ?? EmptyMetrics;

    return {
      Component,
      enabled: di.inject(metricsDetailsComponentEnabledInjectable, metricResourceType),
      orderNumber: -1,
    };
  },
});

