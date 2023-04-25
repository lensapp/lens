/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { ClusterRoleDetails } from "../../../user-management/cluster-roles";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";

const clusterRoleDetailItemInjectable = getInjectable({
  id: "cluster-role-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: ClusterRoleDetails,
      enabled: computed(() => isClusterRole(kubeObject.value.get()?.object)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default clusterRoleDetailItemInjectable;

export const isClusterRole = kubeObjectMatchesToKindAndApiVersion(
  "ClusterRole",
  ["rbac.authorization.k8s.io/v1"],
);
