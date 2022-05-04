/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { ConfirmDialogParams } from "./confirm-dialog";

const confirmDialogStateInjectable = getInjectable({
  id: "confirm-dialog-state",
  instantiate: () => observable.box<ConfirmDialogParams | undefined>(),
});

export default confirmDialogStateInjectable;
