/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import exitAppInjectable from "../../../electron-app/exit-app.injectable";
import { beforeApplicationIsReadyInjectionToken } from "../before-application-is-ready-injection-token";
import whenSystemShutdownInjectable from "../../../electron-app/when-system-shutdown.injectable";

const setupShutdownOfApplicationWhenSystemShutdownsInjectable = getInjectable({
  id: "setup-shutdown-of-application-when-system-shutdowns",

  instantiate: (di) => {
    const exitApp = di.inject(exitAppInjectable);
    const whenSystemShutdown = di.inject(whenSystemShutdownInjectable);

    return {
      run: () => {
        whenSystemShutdown(exitApp);
      },
    };
  },

  injectionToken: beforeApplicationIsReadyInjectionToken,
});

export default setupShutdownOfApplicationWhenSystemShutdownsInjectable;
