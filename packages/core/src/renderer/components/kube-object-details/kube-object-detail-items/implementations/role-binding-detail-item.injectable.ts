/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { RoleBindingDetails } from "../../../user-management/role-bindings";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";

const roleBindingDetailItemInjectable = getInjectable({
  id: "role-binding-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: RoleBindingDetails,
      enabled: computed(() => isRoleBinding(kubeObject.value.get()?.object)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export const isRoleBinding = kubeObjectMatchesToKindAndApiVersion(
  "RoleBinding",
  ["rbac.authorization.k8s.io/v1"],
);

export default roleBindingDetailItemInjectable;
