/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import { beforeFrameStartsInjectionToken } from "../before-frame-starts/tokens";
import initDefaultUpdateChannelInjectable from "../vars/default-update-channel/init.injectable";

const initUserStoreInjectable = getInjectable({
  id: "init-user-store",
  instantiate: (di) => ({
    id: "init-user-store",
    run: () => {
      // This must be done here so as to actually only be instantiated after the dependencies are
      const userStore = di.inject(userStoreInjectable);

      return userStore.load();
    },
    runAfter: di.inject(initDefaultUpdateChannelInjectable),
  }),
  injectionToken: beforeFrameStartsInjectionToken,
});

export default initUserStoreInjectable;
