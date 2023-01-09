/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import type { ClusterRoleBinding } from "../../../../../common/k8s-api/endpoints";
import editClusterRoleBindingNameStateInjectable from "./edit-name-state.injectable";
import clusterRoleBindingDialogStateInjectable from "./state.injectable";

export type OpenClusterRoleBindingDialog = (clusterRoleBinding?: ClusterRoleBinding) => void;

const openClusterRoleBindingDialogInjectable = getInjectable({
  id: "open-cluster-role-binding-dialog",
  instantiate: (di): OpenClusterRoleBindingDialog => {
    const state = di.inject(clusterRoleBindingDialogStateInjectable);
    const editNameState = di.inject(editClusterRoleBindingNameStateInjectable);

    return action((clusterRoleBinding) => {
      state.set({
        isOpen: true,
        clusterRoleBinding,
      });
      editNameState.set(clusterRoleBinding?.getName() ?? "");
    });
  },
});

export default openClusterRoleBindingDialogInjectable;
