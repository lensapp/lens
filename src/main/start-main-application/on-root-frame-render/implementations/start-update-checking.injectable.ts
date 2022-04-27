/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onRootFrameRenderInjectionToken } from "../on-root-frame-render-injection-token";
import { startUpdateChecking } from "../../../app-updater";

const startUpdateCheckingInjectable = getInjectable({
  id: "start-update-checking",

  instantiate: () => ({
    run: () => {
      startUpdateChecking();
    },
  }),

  causesSideEffects: true,

  injectionToken: onRootFrameRenderInjectionToken,
});

export default startUpdateCheckingInjectable;
