/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import environmentVariablesInjectable from "../../../common/utils/environment-variables.injectable";
import disableHardwareAccelerationInjectable from "../../electron-app/features/disable-hardware-acceleration.injectable";
import { beforeElectronIsReadyInjectionToken } from "../runnable-tokens/before-electron-is-ready-injection-token";

const setupHardwareAccelerationInjectable = getInjectable({
  id: "setup-hardware-acceleration",

  instantiate: (di) => {
    const { LENS_DISABLE_GPU: hardwareAccelerationShouldBeDisabled } = di.inject(environmentVariablesInjectable);
    const disableHardwareAcceleration = di.inject(disableHardwareAccelerationInjectable);

    return {
      run: () => {
        if (hardwareAccelerationShouldBeDisabled) {
          disableHardwareAcceleration();
        }
      },
    };
  },

  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupHardwareAccelerationInjectable;
