/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import themeStoreInjectable from "./store.injectable";

const activeThemeInjectable = getInjectable({
  instantiate: (di) => {
    const store = di.inject(themeStoreInjectable);

    return computed(() => store.activeTheme);
  },
  lifecycle: lifecycleEnum.singleton,
});

export default activeThemeInjectable;
