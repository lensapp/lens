/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import addQuotaDialogOpenStateInjectable from "./open-state.injectable";

const openAddQuotaDialogInjectable = getInjectable({
  id: "open-add-quota-dialog",
  instantiate: (di) => {
    const state = di.inject(addQuotaDialogOpenStateInjectable);

    return action(() => state.set(true));
  },
});

export default openAddQuotaDialogInjectable;
