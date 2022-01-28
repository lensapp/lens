/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import type { ClusterRoleBinding } from "../../../common/k8s-api/endpoints";
import { bind } from "../../utils";
import type { ClusterRoleBindingDialogState } from "./dialog.state.injectable";
import clusterRoleBindingDialogStateInjectable from "./dialog.state.injectable";

interface Dependencies {
  state: ClusterRoleBindingDialogState;
}

function openClusterRoleBindingDialog({ state }: Dependencies, clusterRoleBinding: ClusterRoleBinding | null = null): void {
  runInAction(() => {
    state.isOpen = true;
    state.clusterRoleBinding = clusterRoleBinding;
  });
}

const openClusterRoleBindingDialogInjectable = getInjectable({
  instantiate: (di) => bind(openClusterRoleBindingDialog, null, {
    state: di.inject(clusterRoleBindingDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default openClusterRoleBindingDialogInjectable;
