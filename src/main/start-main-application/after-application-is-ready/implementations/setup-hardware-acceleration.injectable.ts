/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import electronAppInjectable from "../../../electron-app/electron-app.injectable";

const setupHardwareAccelerationInjectable = getInjectable({
  id: "setup-hardware-acceleration",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);

    return {
      run: async () => {
        if (process.env.LENS_DISABLE_GPU) {
          app.disableHardwareAcceleration();
        }
      },
    };
  },

  causesSideEffects: true,

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupHardwareAccelerationInjectable;
