/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../../start-main-application/after-application-is-ready/after-application-is-ready-injection-token";
import exitAppInjectable from "../features/exit-app.injectable";
import requestSingleInstanceLockInjectable from "../features/request-single-instance-lock.injectable";

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
