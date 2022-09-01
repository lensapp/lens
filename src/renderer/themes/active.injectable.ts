/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import themeStoreInjectable from "./store.injectable";

const activeThemeInjectable = getInjectable({
  id: "active-theme",
  instantiate: (di) => {
    const store = di.inject(themeStoreInjectable);

    return computed(() => store.activeTheme);
  },
});

export default activeThemeInjectable;
