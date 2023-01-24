/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const addSecretDialogOpenStateInjectable = getInjectable({
  id: "add-secret-dialog-state",
  instantiate: () => observable.box(false),
});

export default addSecretDialogOpenStateInjectable;
