/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { TerminalThemeConf, ColorThemeConf } from "../../common/user-store/preferences-helpers";
import type { ThemeType } from "../../renderer/themes/types";
import type { MigrationDeclaration } from "../helpers";

type Pre550Alpha1ColorTheme = string; // theme-id or "system"
type Pre550TerminalTheme = string; // theme-id or "" (for match)

const themeIdMatcher = /^(?<name>[a-z0-9]+)-(?<type>dark|light)$/i;

const v550alpha1Migration: MigrationDeclaration = {
  version: "5.5.0-alpha.1",
  run(store) {
    const colorTheme = store.get("preferences.colorTheme") as Pre550Alpha1ColorTheme | undefined;
    const terminalTheme = store.get("preferences.terminalTheme") as Pre550TerminalTheme | undefined;

    if (typeof colorTheme !== "string") {
      store.delete("preferences.colorTheme"); // use default
    } else {
      if (colorTheme === "system") {
        const newSetting: ColorThemeConf = {
          followSystemThemeType: true,
          name: "lens",
        };

        store.set("preferences.colorTheme", newSetting);
      } else {
        const match = colorTheme.match(themeIdMatcher);

        if (!match?.groups) {
          store.delete("preferences.colorTheme"); // use default
        } else {
          const newSetting: ColorThemeConf = {
            followSystemThemeType: false,
            name: match.groups.name,
            type: match.groups.type as ThemeType,
          };

          store.set("preferences.colorTheme", newSetting);
        }
      }
    }

    if (typeof terminalTheme !== "string") {
      store.delete("preferences.terminalTheme"); // use default
    } else {
      const match = terminalTheme.match(themeIdMatcher);

      if (!match?.groups) {
        store.delete("preferences.terminalTheme"); // use default
      } else {
        const newSetting: TerminalThemeConf = {
          isGlobalTheme: false,
          isGlobalThemeType: false,
          name: match.groups.name,
          type: match.groups.type as ThemeType,
        };

        store.set("preferences.terminalTheme", newSetting);
      }
    }
  },
};

export default v550alpha1Migration;
