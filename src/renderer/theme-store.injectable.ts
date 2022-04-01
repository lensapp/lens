/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ThemeStore } from "./theme.store";

const themeStoreInjectable = getInjectable({
  id: "theme-store",

  instantiate: () => {
    ThemeStore.resetInstance();

    return ThemeStore.createInstance();
  },

  causesSideEffects: true,
});

export default themeStoreInjectable;
