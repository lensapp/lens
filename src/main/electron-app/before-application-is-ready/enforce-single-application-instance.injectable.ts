/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationIsReadyInjectionToken } from "../../start-main-application/before-application-is-ready/before-application-is-ready-injection-token";
import requestSingleInstanceLockInjectable from "../features/request-single-instance-lock.injectable";
import exitAppInjectable from "../features/exit-app.injectable";

const enforceSingleApplicationInstanceInjectable = getInjectable({
  id: "enforce-single-application-instance",

  instantiate: (di) => {
    const requestSingleInstanceLock = di.inject(requestSingleInstanceLockInjectable);
    const exitApp = di.inject(exitAppInjectable);

    return {
      run: () => {
        if (!requestSingleInstanceLock()) {
          exitApp();
        }
      },
    };
  },

  injectionToken: beforeApplicationIsReadyInjectionToken,
});

export default enforceSingleApplicationInstanceInjectable;
