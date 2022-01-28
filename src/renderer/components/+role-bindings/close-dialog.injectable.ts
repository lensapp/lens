/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import { bind } from "../../utils";
import type { RoleBindingDialogState } from "./dialog.state.injectable";
import roleBindingDialogStateInjectable from "./dialog.state.injectable";

interface Dependencies {
  state: RoleBindingDialogState;
}

function closeRoleBindingDialog({ state }: Dependencies): void {
  runInAction(() => {
    state.isOpen = false;
    state.roleBinding = null;
  });
}

const closeRoleBindingDialogInjectable = getInjectable({
  instantiate: (di) => bind(closeRoleBindingDialog, null, {
    state: di.inject(roleBindingDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closeRoleBindingDialogInjectable;
