/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import userPreferencesStateInjectable from "./state.injectable";

export type LensColorThemePreference = {
  useSystemTheme: true;
} | {
  useSystemTheme: false;
  lensThemeId: string;
};

const lensColorThemePreferenceInjectable = getInjectable({
  id: "lens-color-theme-preference",
  instantiate: (di) => {
    const state = di.inject(userPreferencesStateInjectable);

    return computed((): LensColorThemePreference => {
      // TODO: remove magic strings
      if (state.colorTheme === "system") {
        return {
          useSystemTheme: true,
        };
      }

      return {
        useSystemTheme: false,
        lensThemeId: state.colorTheme,
      };
    });
  },
});

export default lensColorThemePreferenceInjectable;
