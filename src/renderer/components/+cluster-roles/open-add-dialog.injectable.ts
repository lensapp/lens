/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import { bind } from "../../utils";
import type { ClusterRoleAddDialogState } from "./add-dialog.state.injectable";
import ClusterRoleAddDialogStateInjectable from "./add-dialog.state.injectable";

interface Dependencies {
  state: ClusterRoleAddDialogState;
}

function openClusterRoleAddDialog({ state }: Dependencies): void {
  runInAction(() => {
    state.isOpen = true;
  });
}

const openAddClusterRoleDialogInjectable = getInjectable({
  instantiate: (di) => bind(openClusterRoleAddDialog, null, {
    state: di.inject(ClusterRoleAddDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default openAddClusterRoleDialogInjectable;
