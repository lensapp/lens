/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import nativeThemeInjectable from "./native-theme.injectable";

const useDarkColorsInjectable = getInjectable({
  id: "use-dark-colors",
  instantiate: (di) => {
    const nativeTheme = di.inject(nativeThemeInjectable);
    const state = observable.box(nativeTheme.shouldUseDarkColors);

    nativeTheme.on("updated", () => state.set(nativeTheme.shouldUseDarkColors));

    return state;
  },
});

export default useDarkColorsInjectable;
