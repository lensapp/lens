/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import userStoreInjectable from "./user-store.injectable";

const terminalCopyOnSelectInjectable = getInjectable({
  id: "terminal-copy-on-select",
  instantiate: (di) => {
    const store = di.inject(userStoreInjectable);

    return computed(() => store.terminalCopyOnSelect);
  },
});

export default terminalCopyOnSelectInjectable;
