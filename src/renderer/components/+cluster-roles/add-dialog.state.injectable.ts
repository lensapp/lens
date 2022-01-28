/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface ClusterRoleAddDialogState {
  isOpen: boolean;
}

const addClusterRoleDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<ClusterRoleAddDialogState>({
    isOpen: false,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default addClusterRoleDialogStateInjectable;
