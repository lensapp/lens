/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterMetricsResourceType } from "../../../../../common/cluster-types";
import metricsDetailsComponentEnabledInjectable from "../../../../api/catalog/entity/metrics-details-component-enabled.injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { deploymentDetailsMetricsInjectionToken } from "@k8slens/metrics";
import { EmptyMetrics } from "./empty-metrics";

const deploymentMetricsInjectable = getInjectable({
  id: "deployment-details-metrics",
  instantiate: (di) => {
    const deploymentMetrics = di.injectMany(deploymentDetailsMetricsInjectionToken);
    const first = deploymentMetrics[0];

    const Component = first?.Component ?? EmptyMetrics;

    return {
      Component,
      enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.Deployment),
      orderNumber: -1,
    };
  },
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default deploymentMetricsInjectable;
