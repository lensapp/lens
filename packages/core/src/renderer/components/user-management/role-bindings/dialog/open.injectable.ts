/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import type { RoleBinding } from "@k8slens/kube-object";
import roleBindingDialogStateInjectable from "./state.injectable";

export type OpenRoleBindingDialog = (roleBinding?: RoleBinding | undefined) => void;

const openRoleBindingDialogInjectable = getInjectable({
  id: "open-role-binding-dialog",
  instantiate: (di): OpenRoleBindingDialog => {
    const state = di.inject(roleBindingDialogStateInjectable);

    return action((roleBinding) => state.set({
      isOpen: true,
      roleBinding,
    }));
  },
});

export default openRoleBindingDialogInjectable;
