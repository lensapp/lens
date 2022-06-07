/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import addNamespaceDialogStateInjectable from "./state.injectable";

const openAddNamepaceDialogInjectable = getInjectable({
  id: "open-add-namepace-dialog",
  instantiate: (di) => {
    const state = di.inject(addNamespaceDialogStateInjectable);

    return action(() => {
      state.set(true);
    });
  },
});

export default openAddNamepaceDialogInjectable;
