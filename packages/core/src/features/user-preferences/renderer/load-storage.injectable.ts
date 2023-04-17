/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../../renderer/before-frame-starts/tokens";
import { buildVersionInitializationInjectable } from "../../vars/build-version/renderer/init.injectable";
import userPreferencesPersistentStorageInjectable from "../common/storage.injectable";

const loadUserPreferencesStorageInjectable = getInjectable({
  id: "load-user-preferences-storage",
  instantiate: (di) => ({
    run: () => {
      const storage = di.inject(userPreferencesPersistentStorageInjectable);

      return storage.loadAndStartSyncing();
    },
    runAfter: buildVersionInitializationInjectable,
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default loadUserPreferencesStorageInjectable;
