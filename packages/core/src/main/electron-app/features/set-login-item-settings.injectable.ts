/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Settings } from "electron";
import electronAppInjectable from "../electron-app.injectable";

export type SetLoginItemSettings = (settings: Settings) => void;

const setLoginItemSettingsInjectable = getInjectable({
  id: "set-login-item-settings",
  instantiate: (di): SetLoginItemSettings => {
    const electronApp = di.inject(electronAppInjectable);

    return (settings) => electronApp.setLoginItemSettings(settings);
  },
});

export default setLoginItemSettingsInjectable;
