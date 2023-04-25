/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import addNamespaceDialogStateInjectable from "./state.injectable";

const openAddNamespaceDialogInjectable = getInjectable({
  id: "open-add-namespace-dialog",
  instantiate: (di) => {
    const state = di.inject(addNamespaceDialogStateInjectable);

    return action(() => {
      state.set(true);
    });
  },
});

export default openAddNamespaceDialogInjectable;
