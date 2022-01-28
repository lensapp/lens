/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface AddResourceQuotaDialogState {
  isOpen: boolean;
}

const addResourceQuotaDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<AddResourceQuotaDialogState>({
    isOpen: false,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default addResourceQuotaDialogStateInjectable;
