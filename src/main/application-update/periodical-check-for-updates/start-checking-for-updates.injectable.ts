/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import periodicalCheckForUpdatesInjectable from "./periodical-check-for-updates.injectable";
import updatingIsEnabledInjectable from "../updating-is-enabled.injectable";
import { afterApplicationIsLoadedInjectionToken } from "../../start-main-application/runnable-tokens/after-application-is-loaded-injection-token";

const startCheckingForUpdatesInjectable = getInjectable({
  id: "start-checking-for-updates",

  instantiate: (di) => {
    const periodicalCheckForUpdates = di.inject(periodicalCheckForUpdatesInjectable);
    const updatingIsEnabled = di.inject(updatingIsEnabledInjectable);

    return {
      run: async () => {
        if (updatingIsEnabled && !periodicalCheckForUpdates.started) {
          await periodicalCheckForUpdates.start();
        }
      },
    };
  },

  injectionToken: afterApplicationIsLoadedInjectionToken,
});

export default startCheckingForUpdatesInjectable;
