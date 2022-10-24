/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import { computed } from "mobx";
import { now } from "mobx-utils";
import React from "react";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import type { Namespace } from "../../../common/k8s-api/endpoints";
import requestPodMetricsInNamespaceInjectable from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics-in-namespace.injectable";
import getActiveClusterEntityInjectable from "../../api/catalog/entity/get-active-cluster-entity.injectable";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-details/kube-object-detail-items/kube-object-detail-item-injection-token";
import { ResourceMetrics } from "../resource-metrics";

const namespaceMetricsDetailsComponentInjectable = getInjectable({
  id: "namespace-metrics-details-component",
  instantiate: (di) => {
    const getActiveClusterEntity = di.inject(getActiveClusterEntityInjectable);
    const requestPodMetricsInNamespace = di.inject(requestPodMetricsInNamespaceInjectable);

    return {
      Component: (props: KubeObjectDetailsProps<Namespace>) => (
        <ResourceMetrics
          tabs={podMetricTabs}
          object={props.object}
          metrics={asyncComputed(async () => {
            now(60 * 1000); // Update every minute

            return requestPodMetricsInNamespace(props.object.getName());
          })}
        >
          <PodCharts />
        </ResourceMetrics>
      ),
      enabled: computed(() => !getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Namespace)),
      orderNumber: -1,
    };
  },
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default namespaceMetricsDetailsComponentInjectable;
