/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import clustersPersistentStorageInjectable from "../common/storage.injectable";
import loadUserPreferencesStorageInjectable from "../../../user-preferences/main/load-storage.injectable";

const initClusterStoreInjectable = getInjectable({
  id: "init-cluster-store",
  instantiate: (di) => ({
    run: () => {
      const storage = di.inject(clustersPersistentStorageInjectable);

      storage.loadAndStartSyncing();
    },
    runAfter: loadUserPreferencesStorageInjectable,
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initClusterStoreInjectable;
