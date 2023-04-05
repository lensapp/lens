/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { nodeDetailsMetricsInjectionToken } from "@k8slens/metrics";
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterMetricsResourceType } from "../../../../../common/cluster-types";
import metricsDetailsComponentEnabledInjectable from "../../../../api/catalog/entity/metrics-details-component-enabled.injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { EmptyMetrics } from "./empty-metrics";

const nodeMetricsInjectable = getInjectable({
  id: "node-details-metrics",
  instantiate: (di) => {
    const nodeMetrics = di.injectMany(nodeDetailsMetricsInjectionToken);
    const first = nodeMetrics[0];

    const Component = first?.Component ?? EmptyMetrics;

    return {
      Component,
      enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.Node),
      orderNumber: -1,
    };
  },
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default nodeMetricsInjectable;
