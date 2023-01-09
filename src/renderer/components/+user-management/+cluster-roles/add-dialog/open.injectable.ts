/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import addClusterRoleDialogStateInjectable from "./state.injectable";

export type OpenAddClusterRoleDialog = () => void;

const openAddClusterRoleDialogInjectable = getInjectable({
  id: "open-add-cluster-role-dialog",
  instantiate: (di) => {
    const state = di.inject(addClusterRoleDialogStateInjectable);

    return action(() => {
      state.isOpen.set(true);
      state.clusterRoleName.set("");
    });
  },
});

export default openAddClusterRoleDialogInjectable;
