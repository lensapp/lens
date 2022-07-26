/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface AddRoleDialogState {
  name: string;
  namespace: string;
}

const addRoleDialogStateInjectable = getInjectable({
  id: "add-role-dialog-state",
  instantiate: () => observable.box<AddRoleDialogState>(),
});

export default addRoleDialogStateInjectable;
