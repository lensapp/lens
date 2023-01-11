/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import nativeThemeInjectable from "./native-theme.injectable";

const getElectronThemeInjectable = getInjectable({
  id: "get-electron-theme",

  instantiate: (di) => {
    const nativeTheme = di.inject(nativeThemeInjectable);

    return () => nativeTheme.shouldUseDarkColors ? "dark" : "light";
  },
});

export default getElectronThemeInjectable;
