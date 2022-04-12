/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { powerMonitor } from "electron";
import exitAppInjectable from "../../../electron-app/exit-app.injectable";
import { beforeApplicationIsReadyInjectionToken } from "../before-application-is-ready-injection-token";

const setupShutdownOfApplicationWhenSystemShutdownsInjectable = getInjectable({
  id: "setup-shutdown-of-application-when-system-shutdowns",

  instantiate: (di) => {
    const exitApp = di.inject(exitAppInjectable);

    return {
      run: () => {
        powerMonitor.on("shutdown", exitApp);
      },
    };
  },

  causesSideEffects: true,

  injectionToken: beforeApplicationIsReadyInjectionToken,
});

export default setupShutdownOfApplicationWhenSystemShutdownsInjectable;
