/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const activationOfCustomHelmRepositoryDialogIsVisibleInjectable = getInjectable({
  id: "add-custom-helm-repository-dialog-is-visible",
  instantiate: () => observable.box(false),
});

export default activationOfCustomHelmRepositoryDialogIsVisibleInjectable;
