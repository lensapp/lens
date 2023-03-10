/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import { beforeFrameStartsSecondInjectionToken } from "../before-frame-starts/tokens";
import initDefaultUpdateChannelInjectable from "../vars/default-update-channel/init.injectable";

const initUserStoreInjectable = getInjectable({
  id: "init-user-store",
  instantiate: (di) => ({
    run: () => {
      const userStore = di.inject(userStoreInjectable);

      return userStore.load();
    },
    runAfter: initDefaultUpdateChannelInjectable,
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default initUserStoreInjectable;
