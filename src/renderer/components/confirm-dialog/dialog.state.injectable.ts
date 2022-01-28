/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { ConfirmDialogParams } from "./confirm-dialog";

export interface ConfirmDialogState {
  params: ConfirmDialogParams | null;
}

const confirmDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<ConfirmDialogState>({
    params: null,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default confirmDialogStateInjectable;
