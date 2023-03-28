/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import terminalThemePreferenceInjectable from "../../features/user-preferences/common/terminal-theme.injectable";
import activeThemeInjectable from "./active.injectable";
import lensThemesInjectable from "./themes.injectable";

const xtermColorThemeInjectable = getInjectable({
  id: "terminal-colors",
  instantiate: (di) => {
    const activeTheme = di.inject(activeThemeInjectable);
    const terminalThemePreference = di.inject(terminalThemePreferenceInjectable);
    const themes = di.inject(lensThemesInjectable);

    const terminalTheme = computed(() => {
      const themePref = terminalThemePreference.get();

      if (themePref.matchLensTheme) {
        return activeTheme.get();
      }

      return themes.get(themePref.themeId) ?? activeTheme.get();
    });

    return computed(() => terminalTheme.get().terminalColors);
  },
});

export default xtermColorThemeInjectable;
