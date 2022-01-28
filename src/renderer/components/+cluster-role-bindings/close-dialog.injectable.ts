/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import { bind } from "../../utils";
import type { ClusterRoleBindingDialogState } from "./dialog.state.injectable";
import clusterRoleBindingDialogStateInjectable from "./dialog.state.injectable";

interface Dependencies {
  state: ClusterRoleBindingDialogState;
}

function closeClusterRoleBindingDialog({ state }: Dependencies): void {
  runInAction(() => {
    state.isOpen = false;
    state.clusterRoleBinding = null;
  });
}

const closeClusterRoleBindingDialogInjectable = getInjectable({
  instantiate: (di) => bind(closeClusterRoleBindingDialog, null, {
    state: di.inject(clusterRoleBindingDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closeClusterRoleBindingDialogInjectable;
