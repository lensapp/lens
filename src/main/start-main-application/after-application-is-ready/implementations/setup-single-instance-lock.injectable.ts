/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import exitAppInjectable from "../../../electron-app/exit-app.injectable";
import electronAppInjectable from "../../../electron-app/electron-app.injectable";

const setupSingleInstanceLockInjectable = getInjectable({
  id: "setup-single-instance-lock",

  instantiate: (di) => {
    const exitApp = di.inject(exitAppInjectable);
    const app = di.inject(electronAppInjectable);

    return {
      run: () => {
        if (!app.requestSingleInstanceLock()) {
          exitApp();

          return;
        }
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupSingleInstanceLockInjectable;
