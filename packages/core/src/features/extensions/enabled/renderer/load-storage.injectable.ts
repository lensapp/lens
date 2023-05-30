/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../../../renderer/before-frame-starts/tokens";
import enabledExtensionsPersistentStorageInjectable from "../common/storage.injectable";
import { enabledExtensionsPersistentStorageVersionInitializationInjectable } from "./storage-version.injectable";

const loadEnabledExtensionsStorageInjectable = getInjectable({
  id: "load-enabled-extensions-storage",
  instantiate: (di) => ({
    run: () => {
      const storage = di.inject(enabledExtensionsPersistentStorageInjectable);

      storage.loadAndStartSyncing();
    },
    runAfter: enabledExtensionsPersistentStorageVersionInitializationInjectable,
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default loadEnabledExtensionsStorageInjectable;
