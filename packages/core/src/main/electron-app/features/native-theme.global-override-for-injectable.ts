/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import EventEmitter from "events";
import { getGlobalOverride } from "../../../common/test-utils/get-global-override";
import nativeThemeInjectable from "./native-theme.injectable";

export default getGlobalOverride(nativeThemeInjectable, () => Object.assign(new EventEmitter(), {
  shouldUseDarkColors: true,
  inForcedColorsMode: true,
  shouldUseHighContrastColors: false,
  shouldUseInvertedColorScheme: false,
  themeSource: "dark" as const,
}));
