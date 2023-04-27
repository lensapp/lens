/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import { now } from "mobx-utils";
import type { ReplicaSet } from "@k8slens/kube-object";
import requestPodMetricsForReplicaSetsInjectable from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics-for-replica-sets.injectable";

const replicaSetMetricsInjectable = getInjectable({
  id: "replica-set-metrics",
  instantiate: (di, replicaSet) => {
    const requestPodMetricsForReplicaSets = di.inject(requestPodMetricsForReplicaSetsInjectable);

    return asyncComputed({
      getValueFromObservedPromise: async () => {
        now(60 * 1000); // update every minute

        return requestPodMetricsForReplicaSets([replicaSet], replicaSet.getNs());
      },
    });
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, replicaSet: ReplicaSet) => replicaSet.getId(),
  }),
});

export default replicaSetMetricsInjectable;
