/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import { bind } from "../../utils";
import type { RoleAddDialogState } from "./add-dialog.state.injectable";
import RoleAddDialogStateInjectable from "./add-dialog.state.injectable";

interface Dependencies {
  state: RoleAddDialogState;
}

function openAddRoleDialog({ state }: Dependencies): void {
  runInAction(() => {
    state.isOpen = true;
  });
}

const openAddRoleDialogInjectable = getInjectable({
  instantiate: (di) => bind(openAddRoleDialog, null, {
    state: di.inject(RoleAddDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default openAddRoleDialogInjectable;
