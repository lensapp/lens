/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import userPreferencesStateInjectable from "./state.injectable";

export type TerminalThemePreference = {
  matchLensTheme: true;
} | {
  matchLensTheme: false;
  themeId: string;
};

const terminalThemePreferenceInjectable = getInjectable({
  id: "terminal-theme-preference",
  instantiate: (di) => {
    const state = di.inject(userPreferencesStateInjectable);

    return computed((): TerminalThemePreference => {
      // NOTE: remove use of magic strings
      if (!state.terminalTheme) {
        return {
          matchLensTheme: true,
        };
      }

      return {
        matchLensTheme: false,
        themeId: state.terminalTheme,
      };
    });
  },
});

export default terminalThemePreferenceInjectable;
