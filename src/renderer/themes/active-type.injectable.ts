/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import type { LensThemeType } from "./store";
import themeStoreInjectable from "./store.injectable";

export type ActiveThemeType = IComputedValue<LensThemeType>;

const activeThemeTypeInjectable = getInjectable({
  id: "active-theme-type",

  instantiate: (di) => {
    const store = di.inject(themeStoreInjectable);

    return computed(() => store.activeTheme.type);
  },
});

export default activeThemeTypeInjectable;
