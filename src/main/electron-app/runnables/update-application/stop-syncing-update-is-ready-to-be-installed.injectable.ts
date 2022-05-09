/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import syncUpdateIsReadyToBeInstalledInjectable from "./sync-update-is-ready-to-be-installed.injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../../start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";

const stopSyncingUpdateIsReadyToBeInstalledInjectable = getInjectable({
  id: "stop-syncing-update-is-ready-to-be-installed",

  instantiate: (di) => {
    const syncUpdateIsReadyToBeInstalled = di.inject(syncUpdateIsReadyToBeInstalledInjectable);

    return {
      run: () => {
        syncUpdateIsReadyToBeInstalled.stop();
      },
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopSyncingUpdateIsReadyToBeInstalledInjectable;
