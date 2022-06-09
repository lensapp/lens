/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import periodicalCheckForUpdatesInjectable from "./periodical-check-for-updates.injectable";
import { afterRootFrameIsReadyInjectionToken } from "../../start-main-application/runnable-tokens/after-root-frame-is-ready-injection-token";
import updatingIsEnabledInjectable from "../updating-is-enabled.injectable";

const startCheckingForUpdatesInjectable = getInjectable({
  id: "start-checking-for-updates",

  instantiate: (di) => {
    const periodicalCheckForUpdates = di.inject(periodicalCheckForUpdatesInjectable);
    const updatingIsEnabled = di.inject(updatingIsEnabledInjectable);

    return {
      run: async () => {
        if (updatingIsEnabled) {
          await periodicalCheckForUpdates.start();
        }
      },
    };
  },

  injectionToken: afterRootFrameIsReadyInjectionToken,
});

export default startCheckingForUpdatesInjectable;
