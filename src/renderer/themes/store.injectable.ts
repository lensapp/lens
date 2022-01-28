/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import colorThemeIdInjectable from "../../common/user-preferences/color-theme-id.injectable";
import resetThemeSettingsInjectable from "../../common/user-preferences/reset-theme-settings.injectable";
import terminalThemeIdInjectable from "../../common/user-preferences/terminal-theme-id.injectable";
import { ThemeStore } from "./store";

const themeStoreInjectable = getInjectable({
  instantiate: (di) => new ThemeStore({
    colorThemeId: di.inject(colorThemeIdInjectable),
    terminalThemeId: di.inject(terminalThemeIdInjectable),
    resetThemeSelection: di.inject(resetThemeSettingsInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default themeStoreInjectable;
