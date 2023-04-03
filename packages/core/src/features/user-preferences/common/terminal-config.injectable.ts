/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed, toJS } from "mobx";
import userPreferencesStateInjectable from "./state.injectable";

const terminalConfigInjectable = getInjectable({
  id: "terminal-config",
  instantiate: (di) => {
    const state = di.inject(userPreferencesStateInjectable);

    return computed(() => toJS(state.terminalConfig));
  },
});

export default terminalConfigInjectable;
