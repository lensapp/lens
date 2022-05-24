/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterRootFrameIsReadyInjectionToken } from "../../start-main-application/runnable-tokens/after-root-frame-is-ready-injection-token";
import startUpdateCheckingInjectable from "../../start-update-checking.injectable";

const setupUpdateCheckingInjectable = getInjectable({
  id: "setup-update-checking",

  instantiate: (di) => {
    const startUpdateChecking = di.inject(startUpdateCheckingInjectable);

    return {
      run: () => {
        startUpdateChecking();
      },
    };
  },

  injectionToken: afterRootFrameIsReadyInjectionToken,
});

export default setupUpdateCheckingInjectable;
