/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { ClusterRoleBinding } from "../../../common/k8s-api/endpoints";

export interface ClusterRoleBindingDialogState {
  isOpen: boolean;
  clusterRoleBinding: ClusterRoleBinding | null;
}

const clusterRoleBindingDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<ClusterRoleBindingDialogState>({
    isOpen: false,
    clusterRoleBinding: null,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default clusterRoleBindingDialogStateInjectable;
