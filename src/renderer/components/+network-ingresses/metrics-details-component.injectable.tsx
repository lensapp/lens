/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import { computed } from "mobx";
import { now } from "mobx-utils";
import React from "react";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { Ingress } from "../../../common/k8s-api/endpoints";
import requestIngressMetricsInjectable from "../../../common/k8s-api/endpoints/metrics.api/request-ingress-metrics.injectable";
import getActiveClusterEntityInjectable from "../../api/catalog/entity/get-active-cluster-entity.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
import { ResourceMetrics } from "../resource-metrics";
import { IngressCharts } from "./ingress-charts";

const ingressMetricsDetailsComponentInjectable = getInjectable({
  id: "ingress-metrics-details-component",
  instantiate: (di) => {
    const getActiveClusterEntity = di.inject(getActiveClusterEntityInjectable);
    const requestIngressMetrics = di.inject(requestIngressMetricsInjectable);

    return {
      Component: ({ object }: KubeObjectDetailsProps<Ingress>) => (
        <ResourceMetrics
          tabs={[
            "Network",
            "Duration",
          ]}
          object={object}
          metrics={asyncComputed(async () => {
            now(60 * 1000); // Update every minute

            return requestIngressMetrics(object.getName(), object.getNs());
          })}
        >
          <IngressCharts />
        </ResourceMetrics>
      ),
      enabled: computed(() => !getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Ingress)),
      orderNumber: -1,
    };
  },
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default ingressMetricsDetailsComponentInjectable;
