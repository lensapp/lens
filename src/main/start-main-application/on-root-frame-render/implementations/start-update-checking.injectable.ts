/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onRootFrameRenderInjectionToken } from "../on-root-frame-render-injection-token";
import { startUpdateChecking } from "../../../app-updater";
import isAutoUpdateEnabledInjectable from "../../../is-auto-update-enabled.injectable";

const startUpdateCheckingInjectable = getInjectable({
  id: "start-update-checking",

  instantiate: (di) => {
    const isAutoUpdateEnabled = di.inject(isAutoUpdateEnabledInjectable);


    return {
      run: () => {
        startUpdateChecking(isAutoUpdateEnabled)();
      },
    };
  },

  causesSideEffects: true,

  injectionToken: onRootFrameRenderInjectionToken,
});

export default startUpdateCheckingInjectable;
