/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import getElectronThemeInjectable from "../electron-app/features/get-electron-theme.injectable";

export type Theme = "dark" | "light";

const operatingSystemThemeStateInjectable = getInjectable({
  id: "operating-system-theme-state",

  instantiate: (di) => {
    const getElectronTheme = di.inject(getElectronThemeInjectable);
    const defaultTheme = getElectronTheme();

    return observable.box<Theme>(
      defaultTheme,
    );
  },
});

export default operatingSystemThemeStateInjectable;
