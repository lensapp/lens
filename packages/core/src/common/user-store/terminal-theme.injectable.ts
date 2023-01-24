/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import userStoreInjectable from "./user-store.injectable";

export type TerminalThemePreference = {
  matchLensTheme: true;
} | {
  matchLensTheme: false;
  themeId: string;
};

const terminalThemePreferenceInjectable = getInjectable({
  id: "terminal-theme-preference",
  instantiate: (di) => {
    const userStore = di.inject(userStoreInjectable);

    return computed((): TerminalThemePreference => {
      // NOTE: remove use of magic strings
      if (!userStore.terminalTheme) {
        return {
          matchLensTheme: true,
        };
      }

      return {
        matchLensTheme: false,
        themeId: userStore.terminalTheme,
      };
    });
  },
});

export default terminalThemePreferenceInjectable;
