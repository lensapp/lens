/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import { bind } from "../../utils";
import type { RoleAddDialogState } from "./add-dialog.state.injectable";
import RoleDialogStateInjectable from "./add-dialog.state.injectable";

interface Dependencies {
  state: RoleAddDialogState;
}

function closeAddRoleDialog({ state }: Dependencies): void {
  runInAction(() => {
    state.isOpen = false;
  });
}

const closeAddRoleDialogInjectable = getInjectable({
  instantiate: (di) => bind(closeAddRoleDialog, null, {
    state: di.inject(RoleDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closeAddRoleDialogInjectable;
