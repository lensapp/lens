/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import initDefaultUpdateChannelInjectable from "../../../main/vars/default-update-channel/init.injectable";
import userPreferencesPersistentStorageInjectable from "../common/storage.injectable";
import userPreferencesStorageFileNameMigrationInjectable from "./file-name-migration.injectable";

const loadUserPreferencesStorageInjectable = getInjectable({
  id: "load-user-preferences-storage",
  instantiate: (di) => ({
    run: async () => {
      const storage = di.inject(userPreferencesPersistentStorageInjectable);
      const userStoreFileNameMigration = di.inject(userPreferencesStorageFileNameMigrationInjectable);

      await userStoreFileNameMigration();
      storage.loadAndStartSyncing();
    },
    runAfter: initDefaultUpdateChannelInjectable,
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default loadUserPreferencesStorageInjectable;
