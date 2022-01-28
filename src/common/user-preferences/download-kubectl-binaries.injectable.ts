/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import userPreferencesStoreInjectable from "./store.injectable";

const downloadKubectlBinariesInjectable = getInjectable({
  instantiate: (di) => {
    const userStore = di.inject(userPreferencesStoreInjectable);

    return computed(() => userStore.downloadKubectlBinaries);
  },
  lifecycle: lifecycleEnum.singleton,
});

export default downloadKubectlBinariesInjectable;
