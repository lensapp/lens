/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import logStoreInjectable from "./log-store.injectable";

const reloadedLogStoreInjectable = getInjectable({
  instantiate: async (di) => {
    const nonReloadedStore = di.inject(logStoreInjectable);

    await nonReloadedStore.reload();

    return nonReloadedStore;
  },

  lifecycle: lifecycleEnum.transient,
});

export default reloadedLogStoreInjectable;
