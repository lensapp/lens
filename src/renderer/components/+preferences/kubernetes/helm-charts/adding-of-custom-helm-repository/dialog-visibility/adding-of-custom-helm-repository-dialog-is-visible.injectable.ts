/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const addingOfCustomHelmRepositoryDialogIsVisibleInjectable = getInjectable({
  id: "adding-of-custom-helm-repository-dialog-is-visible",
  instantiate: () => observable.box(false),
});

export default addingOfCustomHelmRepositoryDialogIsVisibleInjectable;
