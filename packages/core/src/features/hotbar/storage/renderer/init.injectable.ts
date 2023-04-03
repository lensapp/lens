/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../../../renderer/before-frame-starts/tokens";
import initClusterStoreInjectable from "../../../cluster/storage/renderer/init.injectable";
import hotbarsPersistentStorageInjectable from "../common/storage.injectable";

const loadHotbarStorageInjectable = getInjectable({
  id: "load-hotbar-storage",
  instantiate: (di) => ({
    run: () => {
      const storage = di.inject(hotbarsPersistentStorageInjectable);

      storage.loadAndStartSyncing();
    },
    runAfter: initClusterStoreInjectable,
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default loadHotbarStorageInjectable;
