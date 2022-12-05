/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import hotbarStoreInjectable from "../../../../common/hotbars/store.injectable";
import { beforeFrameStartsInjectionToken } from "../../../../renderer/before-frame-starts/tokens";
import initClusterStoreInjectable from "../../../cluster/store/renderer/init.injectable";

const initHotbarStoreInjectable = getInjectable({
  id: "init-hotbar-store",
  instantiate: (di) => ({
    id: "init-hotbar-store",
    run: () => {
      const hotbarStore = di.inject(hotbarStoreInjectable);

      hotbarStore.load();
    },
    runAfter: di.inject(initClusterStoreInjectable),
  }),
  injectionToken: beforeFrameStartsInjectionToken,
});

export default initHotbarStoreInjectable;
