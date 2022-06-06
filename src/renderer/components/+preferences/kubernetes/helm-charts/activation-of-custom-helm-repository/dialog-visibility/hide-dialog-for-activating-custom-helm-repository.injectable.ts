/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import activationOfCustomHelmRepositoryDialogIsVisibleInjectable from "./activation-of-custom-helm-repository-dialog-is-visible.injectable";

const hideDialogForActivatingCustomHelmRepositoryInjectable = getInjectable({
  id: "hide-dialog-for-activating-custom-helm-repository",

  instantiate: (di) => {
    const state = di.inject(activationOfCustomHelmRepositoryDialogIsVisibleInjectable);

    return action(() => {
      state.set(false);
    });
  },
});

export default hideDialogForActivatingCustomHelmRepositoryInjectable;
