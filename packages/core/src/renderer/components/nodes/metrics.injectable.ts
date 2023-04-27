/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import { now } from "mobx-utils";
import type { Node } from "@k8slens/kube-object";
import requestClusterMetricsByNodeNamesInjectable from "../../../common/k8s-api/endpoints/metrics.api/request-cluster-metrics-by-node-names.injectable";

const nodeMetricsInjectable = getInjectable({
  id: "node-metrics",
  instantiate: (di, node) => {
    const requestClusterMetricsByNodeNames = di.inject(requestClusterMetricsByNodeNamesInjectable);

    return asyncComputed({
      getValueFromObservedPromise: () => {
        now(60 * 1000);

        return requestClusterMetricsByNodeNames([node.getName()]);
      },
    });
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, node: Node) => node.getId(),
  }),
});

export default nodeMetricsInjectable;
