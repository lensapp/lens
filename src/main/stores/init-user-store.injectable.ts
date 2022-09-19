/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import initDefaultUpdateChannelInjectableInjectable from "../vars/default-update-channel/init.injectable";

const initUserStoreInjectable = getInjectable({
  id: "init-user-store",
  instantiate: (di) => {
    const userStore = di.inject(userStoreInjectable);

    return {
      run: () => userStore.load(),
      runAfter: di.inject(initDefaultUpdateChannelInjectableInjectable),
    };
  },
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initUserStoreInjectable;
