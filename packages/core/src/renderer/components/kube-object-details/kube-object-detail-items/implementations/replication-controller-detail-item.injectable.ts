/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import {
  kubeObjectMatchesToKindAndApiVersion,
} from "../kube-object-matches-to-kind-and-api-version";
import {
  currentKubeObjectInDetailsInjectable2,
} from "../../current-kube-object-in-details.injectable";
import { ReplicationControllerDetails } from "../../../+workloads-replicationcontrollers";
import type { KubeObject } from "../../../../../common/k8s-api/kube-object";

const replicationControllerDetailItemInjectable = getInjectable({
  id: "replication-controller-detail-item",

  instantiate(di) {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable2);

    return {
      Component: ReplicationControllerDetails,
      enabled: computed(() => isReplicationController(kubeObject.get() as KubeObject)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export const isReplicationController = kubeObjectMatchesToKindAndApiVersion(
  "ReplicationController",
  ["v1"],
);

export default replicationControllerDetailItemInjectable;
