/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AddRoleDialogState } from "./state.injectable";
import addRoleDialogStateInjectable from "./state.injectable";

export type OpenAddRoleDialog = () => void;

const openAddRoleDialogInjectable = getInjectable({
  id: "open-add-role-dialog",
  instantiate: (di): OpenAddRoleDialog => {
    const state = di.inject(addRoleDialogStateInjectable);

    return () => state.set(getBlankAddRoleDialogState());
  },
});

const getBlankAddRoleDialogState = (): AddRoleDialogState => ({
  name: "",
  namespace: "",
});

export default openAddRoleDialogInjectable;
