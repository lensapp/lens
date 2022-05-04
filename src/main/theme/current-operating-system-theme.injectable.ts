/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import currentOperatingSystemThemeStateInjectable from "./current-operating-system-theme-state.injectable";

const currentOperatingSystemThemeInjectable = getInjectable({
  id: "current-operating-system-theme",

  instantiate: (di) => {
    const currentThemeState = di.inject(currentOperatingSystemThemeStateInjectable);

    return computed(() => currentThemeState.get());
  },
});

export default currentOperatingSystemThemeInjectable;
