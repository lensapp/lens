/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { podDetailsMetricsInjectionToken } from "@k8slens/metrics";
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterMetricsResourceType } from "../../../../common/cluster-types";
import metricsDetailsComponentEnabledInjectable from "../../../api/catalog/entity/metrics-details-component-enabled.injectable";
import { kubeObjectDetailItemInjectionToken } from "./kube-object-detail-item-injection-token";

const Empty = () => <></>;

const podMetricsInjectable = getInjectable({
  id: "kube-object-pod-metrics-injectable",
  instantiate: (di) => {
    const podMetrics = di.injectMany(podDetailsMetricsInjectionToken);
    const first = podMetrics[0];

    const Component = first ?? Empty;

    return {
      Component,
      enabled: di.inject(metricsDetailsComponentEnabledInjectable, ClusterMetricsResourceType.Pod),
      orderNumber: -1,
    };
  },
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default podMetricsInjectable;
