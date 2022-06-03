/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfFrontEndInjectionToken } from "../../start-main-application/runnable-tokens/before-quit-of-front-end-injection-token";
import periodicalCheckForUpdatesInjectable from "./periodical-check-for-updates.injectable";

const stopCheckingForUpdatesInjectable = getInjectable({
  id: "stop-checking-for-updates",

  instantiate: (di) => {
    const periodicalCheckForUpdates = di.inject(periodicalCheckForUpdatesInjectable);

    return {
      run: async () => {
        if (periodicalCheckForUpdates.started) {
          await periodicalCheckForUpdates.stop();
        }
      },
    };
  },

  injectionToken: beforeQuitOfFrontEndInjectionToken,
});

export default stopCheckingForUpdatesInjectable;
