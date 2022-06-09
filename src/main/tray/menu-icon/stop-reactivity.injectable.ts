/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";
import reactiveTrayMenuIconInjectable from "./reactive.injectable";

const stopReactiveTrayMenuIconInjectable = getInjectable({
  id: "stop-reactive-tray-menu-icon",

  instantiate: (di) => {
    const reactiveTrayMenuIcon = di.inject(reactiveTrayMenuIconInjectable);

    return {
      run: async () => {
        await reactiveTrayMenuIcon.stop();
      },
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopReactiveTrayMenuIconInjectable;
