/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import { bind } from "../../utils";
import type { ClusterRoleAddDialogState } from "./add-dialog.state.injectable";
import ClusterRoleDialogStateInjectable from "./add-dialog.state.injectable";

interface Dependencies {
  state: ClusterRoleAddDialogState;
}

function closeAddClusterRoleDialog({ state }: Dependencies): void {
  runInAction(() => {
    state.isOpen = false;
  });
}

const closeAddClusterRoleDialogInjectable = getInjectable({
  instantiate: (di) => bind(closeAddClusterRoleDialog, null, {
    state: di.inject(ClusterRoleDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closeAddClusterRoleDialogInjectable;
