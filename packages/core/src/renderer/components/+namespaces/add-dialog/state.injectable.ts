/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const addNamespaceDialogStateInjectable = getInjectable({
  id: "add-namespace-dialog-state",
  instantiate: () => observable.box(false),
});

export default addNamespaceDialogStateInjectable;
