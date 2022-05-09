/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import syncUpdateIsReadyToBeInstalledInjectable from "./sync-update-is-ready-to-be-installed.injectable";
import { onLoadOfApplicationInjectionToken } from "../../../start-main-application/runnable-tokens/on-load-of-application-injection-token";

const startSyncingUpdateIsReadyToBeInstalledInjectable = getInjectable({
  id: "start-syncing-update-is-ready-to-be-installed",

  instantiate: (di) => {
    const syncUpdateIsReadyToBeInstalledState = di.inject(syncUpdateIsReadyToBeInstalledInjectable);

    return {
      run: () => {
        syncUpdateIsReadyToBeInstalledState.start();
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startSyncingUpdateIsReadyToBeInstalledInjectable;
