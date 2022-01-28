/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import userPreferencesStoreInjectable from "./store.injectable";

const terminalThemeIdInjectable = getInjectable({
  instantiate: (di) => {
    const userStore = di.inject(userPreferencesStoreInjectable);

    return computed(() => userStore.terminalTheme);
  },
  lifecycle: lifecycleEnum.singleton,
});

export default terminalThemeIdInjectable;
