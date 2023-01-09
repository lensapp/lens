/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import addQuotaDialogOpenStateInjectable from "./open-state.injectable";

const isAddQuotaDialogOpenInjectable = getInjectable({
  id: "is-add-quota-dialog-open",
  instantiate: (di) => {
    const state = di.inject(addQuotaDialogOpenStateInjectable);

    return computed(() => state.get());
  },
});

export default isAddQuotaDialogOpenInjectable;
