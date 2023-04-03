/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import userPreferencesStateInjectable from "./state.injectable";

const terminalCopyOnSelectInjectable = getInjectable({
  id: "terminal-copy-on-select",
  instantiate: (di) => {
    const state = di.inject(userPreferencesStateInjectable);

    return computed(() => state.terminalCopyOnSelect);
  },
});

export default terminalCopyOnSelectInjectable;
