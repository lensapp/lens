/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import editClusterRoleBindingNameStateInjectable from "./edit-name-state.injectable";
import clusterRoleBindingDialogStateInjectable from "./state.injectable";

export type CloseClusterRoleBindingDialog = () => void;

const closeClusterRoleBindingDialogInjectable = getInjectable({
  id: "close-cluster-role-binding-dialog",
  instantiate: (di): CloseClusterRoleBindingDialog => {
    const state = di.inject(clusterRoleBindingDialogStateInjectable);
    const editNameState = di.inject(editClusterRoleBindingNameStateInjectable);

    return action(() => {
      state.set({
        isOpen: false,
      });
      editNameState.set("");
    });
  },
});

export default closeClusterRoleBindingDialogInjectable;
