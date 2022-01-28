/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface RoleAddDialogState {
  isOpen: boolean;
}

const addRoleDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<RoleAddDialogState>({
    isOpen: false,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default addRoleDialogStateInjectable;
