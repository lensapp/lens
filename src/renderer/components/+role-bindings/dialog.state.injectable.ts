/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { RoleBinding } from "../../../common/k8s-api/endpoints";

export interface RoleBindingDialogState {
  isOpen: boolean;
  roleBinding: RoleBinding | null;
}

const roleBindingDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<RoleBindingDialogState>({
    isOpen: false,
    roleBinding: null,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default roleBindingDialogStateInjectable;
