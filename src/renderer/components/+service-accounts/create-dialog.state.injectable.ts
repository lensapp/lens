/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface ServiceAccountCreateDialogState {
  isOpen: boolean;
}

const createServiceAccountDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<ServiceAccountCreateDialogState>({
    isOpen: false,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default createServiceAccountDialogStateInjectable;
