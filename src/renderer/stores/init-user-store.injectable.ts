/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import { initDefaultUpdateChannelOnRendererInjectable } from "../../features/application-update/common/selected-update-channel/default-update-channel.injectable";
import { beforeFrameStartsInjectionToken } from "../before-frame-starts/before-frame-starts-injection-token";

const initUserStoreInjectable = getInjectable({
  id: "init-user-store",
  instantiate: (di) => {
    const userStore = di.inject(userStoreInjectable);

    return {
      id: "init-user-store",
      run: () => userStore.load(),
      runAfter: di.inject(initDefaultUpdateChannelOnRendererInjectable),
    };
  },
  injectionToken: beforeFrameStartsInjectionToken,
});

export default initUserStoreInjectable;
