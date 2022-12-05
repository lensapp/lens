/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import hotbarStoreInjectable from "../../../../common/hotbars/store.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../../../../main/start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import initClusterStoreInjectable from "../../../cluster/store/main/init.injectable";

const initHotbarStoreInjectable = getInjectable({
  id: "init-hotbar-store",
  instantiate: (di) => {
    const hotbarStore = di.inject(hotbarStoreInjectable);

    return {
      id: "init-hotbar-store",
      run: () => {
        hotbarStore.load();
      },
      runAfter: di.inject(initClusterStoreInjectable),
    };
  },
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initHotbarStoreInjectable;
