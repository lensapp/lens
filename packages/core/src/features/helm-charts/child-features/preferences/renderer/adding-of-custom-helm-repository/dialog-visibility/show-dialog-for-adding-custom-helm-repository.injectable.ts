/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import addingOfCustomHelmRepositoryDialogIsVisibleInjectable from "./adding-of-custom-helm-repository-dialog-is-visible.injectable";

const showDialogForAddingCustomHelmRepositoryInjectable = getInjectable({
  id: "show-dialog-for-adding-custom-helm-repository",

  instantiate: (di) => {
    const state = di.inject(addingOfCustomHelmRepositoryDialogIsVisibleInjectable);

    return action(() => {
      state.set(true);
    });
  },
});

export default showDialogForAddingCustomHelmRepositoryInjectable;
