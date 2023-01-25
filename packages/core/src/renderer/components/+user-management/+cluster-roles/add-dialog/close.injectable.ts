/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import addClusterRoleDialogStateInjectable from "./state.injectable";

const closeAddClusterRoleDialogInjectable = getInjectable({
  id: "close-add-cluster-role-dialog",
  instantiate: (di) => {
    const state = di.inject(addClusterRoleDialogStateInjectable);

    return action(() => {
      state.isOpen.set(false);
      state.clusterRoleName.set("");
    });
  },
});

export default closeAddClusterRoleDialogInjectable;
