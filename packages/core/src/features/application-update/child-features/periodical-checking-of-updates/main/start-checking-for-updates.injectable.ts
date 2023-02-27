/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import periodicalCheckForUpdatesInjectable from "./periodical-check-for-updates.injectable";
import updatingIsEnabledInjectable from "../../../main/updating-is-enabled/updating-is-enabled.injectable";
import { afterApplicationIsLoadedInjectionToken } from "../../../../../main/start-main-application/runnable-tokens/phases";

const startCheckingForUpdatesInjectable = getInjectable({
  id: "start-checking-for-updates",

  instantiate: (di) => ({
    run: () => {
      const periodicalCheckForUpdates = di.inject(periodicalCheckForUpdatesInjectable);
      const updatingIsEnabled = di.inject(updatingIsEnabledInjectable);

      if (updatingIsEnabled && !periodicalCheckForUpdates.started) {
        periodicalCheckForUpdates.start();
      }
    },
  }),

  injectionToken: afterApplicationIsLoadedInjectionToken,
});

export default startCheckingForUpdatesInjectable;
