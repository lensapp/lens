/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import exitAppInjectable from "../../../electron-app/exit-app.injectable";
import { beforeDeviceShutdownInjectionToken } from "../before-device-shutdown-injection-token";

const exitAppBeforeShutdownInjectable = getInjectable({
  id: "exit-app-before-shutdown",

  instantiate: (di) => {
    const exitApp = di.inject(exitAppInjectable);

    return {
      run: () => {
        exitApp();
      },
    };
  },

  injectionToken: beforeDeviceShutdownInjectionToken,
});

export default exitAppBeforeShutdownInjectable;
