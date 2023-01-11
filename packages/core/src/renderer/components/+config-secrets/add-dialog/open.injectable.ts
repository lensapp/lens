/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import addSecretDialogOpenStateInjectable from "./state.injectable";

const openAddSecretDialogInjectable = getInjectable({
  id: "open-add-secret-dialog",
  instantiate: (di) => {
    const state = di.inject(addSecretDialogOpenStateInjectable);

    return action(() => state.set(true));
  },
});

export default openAddSecretDialogInjectable;
