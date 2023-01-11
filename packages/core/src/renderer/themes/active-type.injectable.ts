/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import activeThemeInjectable from "./active.injectable";
import type { LensThemeType } from "./lens-theme";

export type ActiveThemeType = IComputedValue<LensThemeType>;

const activeThemeTypeInjectable = getInjectable({
  id: "active-theme-type",

  instantiate: (di) => {
    const activeTheme = di.inject(activeThemeInjectable);

    return computed(() => activeTheme.get().type);
  },
});

export default activeThemeTypeInjectable;
