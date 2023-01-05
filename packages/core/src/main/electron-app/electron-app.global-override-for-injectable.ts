/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getGlobalOverride } from "../../common/test-utils/get-global-override";
import electronAppInjectable from "./electron-app.injectable";

export default getGlobalOverride(electronAppInjectable, () => ({
  getVersion: () => "6.0.0",
  setLoginItemSettings: () => {},
  commandLine: {
    appendArgument: () => {},
    appendSwitch: () => {},
    getSwitchValue: () => "",
    hasSwitch: () => false,
    removeSwitch: () => {},
  },
} as Partial<Electron.App> as Electron.App));
