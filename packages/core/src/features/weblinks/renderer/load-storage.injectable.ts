/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../../renderer/before-frame-starts/tokens";
import weblinksPersistentStorageInjectable from "../common/storage.injectable";

const loadWeblinkStorageInjectable = getInjectable({
  id: "load-weblink-storage",
  instantiate: (di) => ({
    run: () => {
      const storage = di.inject(weblinksPersistentStorageInjectable);

      storage.loadAndStartSyncing();
    },
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default loadWeblinkStorageInjectable;
