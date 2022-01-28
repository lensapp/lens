/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import type { RoleBinding } from "../../../common/k8s-api/endpoints";
import { bind } from "../../utils";
import type { RoleBindingDialogState } from "./dialog.state.injectable";
import roleBindingDialogStateInjectable from "./dialog.state.injectable";

interface Dependencies {
  state: RoleBindingDialogState;
}

function openRoleBindingDialog({ state }: Dependencies, roleBinding: RoleBinding | null = null): void {
  runInAction(() => {
    state.isOpen = true;
    state.roleBinding = roleBinding;
  });
}

const openRoleBindingDialogInjectable = getInjectable({
  instantiate: (di) => bind(openRoleBindingDialog, null, {
    state: di.inject(roleBindingDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default openRoleBindingDialogInjectable;
