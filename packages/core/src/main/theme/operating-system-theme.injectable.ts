/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import operatingSystemThemeStateInjectable from "./operating-system-theme-state.injectable";

const operatingSystemThemeInjectable = getInjectable({
  id: "operating-system-theme",

  instantiate: (di) => {
    const currentThemeState = di.inject(operatingSystemThemeStateInjectable);

    return computed(() => currentThemeState.get());
  },
});

export default operatingSystemThemeInjectable;
