/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { ClusterRoleBindingDetails } from "../../../user-management/cluster-role-bindings";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";

const clusterRoleBindingDetailItemInjectable = getInjectable({
  id: "cluster-role-binding-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: ClusterRoleBindingDetails,
      enabled: computed(() => isClusterRoleBinding(kubeObject.value.get()?.object)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default clusterRoleBindingDetailItemInjectable;

export const isClusterRoleBinding = kubeObjectMatchesToKindAndApiVersion(
  "ClusterRoleBinding",
  ["rbac.authorization.k8s.io/v1"],
);
