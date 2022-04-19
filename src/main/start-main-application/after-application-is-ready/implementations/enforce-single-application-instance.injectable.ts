/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import exitAppInjectable from "../../../electron-app/exit-app.injectable";
import requestSingleInstanceLockInjectable from "../../../electron-app/request-single-instance-lock.injectable";

const enforceSingleApplicationInstanceInjectable = getInjectable({
  id: "enforce-single-application-instance",

  instantiate: (di) => {
    const exitApp = di.inject(exitAppInjectable);
    const requestSingleInstanceLock = di.inject(requestSingleInstanceLockInjectable);

    return {
      run: () => {
        if (!requestSingleInstanceLock()) {
          exitApp();

          return;
        }
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default enforceSingleApplicationInstanceInjectable;
