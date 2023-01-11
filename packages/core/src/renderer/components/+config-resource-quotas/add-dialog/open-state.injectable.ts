/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const addQuotaDialogOpenStateInjectable = getInjectable({
  id: "add-quota-dialog-open-state",
  instantiate: () => observable.box(false),
});

export default addQuotaDialogOpenStateInjectable;
