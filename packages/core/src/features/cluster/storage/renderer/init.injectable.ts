/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../../../renderer/before-frame-starts/tokens";
import initUserStoreInjectable from "../../../user-preferences/renderer/load-storage.injectable";
import clustersPersistentStorageInjectable from "../common/storage.injectable";

const initClusterStoreInjectable = getInjectable({
  id: "init-cluster-store",
  instantiate: (di) => ({
    run: () => {
      const storage = di.inject(clustersPersistentStorageInjectable);

      storage.loadAndStartSyncing();
    },
    runAfter: initUserStoreInjectable,
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default initClusterStoreInjectable;
