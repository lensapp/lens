/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import createServiceAccountDialogStateInjectable from "./state.injectable";

const closeCreateServiceAccountDialogInjectable = getInjectable({
  id: "close-create-service-account-dialog",
  instantiate: (di) => {
    const state = di.inject(createServiceAccountDialogStateInjectable);

    return action(() => {
      state.isOpen.set(false);
      state.name.set("");
      state.namespace.set("default");
    });
  },
});

export default closeCreateServiceAccountDialogInjectable;
