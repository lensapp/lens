/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { nativeTheme } from "electron";

const nativeThemeInjectable = getInjectable({
  id: "native-theme",
  instantiate: () => nativeTheme,
  causesSideEffects: true,
});

export default nativeThemeInjectable;
