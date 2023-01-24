/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import addRoleDialogStateInjectable from "./state.injectable";

const closeAddRoleDialogInjectable = getInjectable({
  id: "close-add-role-dialog",
  instantiate: (di) => {
    const state = di.inject(addRoleDialogStateInjectable);

    return action(() => {
      state.isOpen.set(false);
      state.namespace.set("");
      state.roleName.set("");
    });
  },
});

export default closeAddRoleDialogInjectable;
