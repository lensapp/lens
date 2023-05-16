/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import { now } from "mobx-utils";
import type { ClusterMetricData } from "../../../common/k8s-api/endpoints/metrics.api/request-cluster-metrics-by-node-names.injectable";
import requestClusterMetricsByNodeNamesInjectable from "../../../common/k8s-api/endpoints/metrics.api/request-cluster-metrics-by-node-names.injectable";
import selectedNodeRoleForMetricsInjectable from "./overview/selected-node-role-for-metrics.injectable";

const everyMinute = 60 * 1000;

const clusterOverviewMetricsInjectable = getInjectable({
  id: "cluster-overview-metrics",
  instantiate: (di) => {
    const requestClusterMetricsByNodeNames = di.inject(requestClusterMetricsByNodeNamesInjectable);
    const selectedNodeRoleForMetrics = di.inject(selectedNodeRoleForMetricsInjectable);

    return asyncComputed<ClusterMetricData | undefined>({
      getValueFromObservedPromise: async () => {
        now(everyMinute);

        const nodeNames = selectedNodeRoleForMetrics
          .nodes
          .get()
          .map(node => node.getName());

        return requestClusterMetricsByNodeNames(nodeNames);
      },
      betweenUpdates: "show-latest-value",
    });
  },
});

export default clusterOverviewMetricsInjectable;
