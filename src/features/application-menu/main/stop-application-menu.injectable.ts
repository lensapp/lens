/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuReactivityInjectable from "./application-menu-reactivity.injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../../main/start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";

const stopApplicationMenuInjectable = getInjectable({
  id: "stop-application-menu",

  instantiate: (di) => {
    const applicationMenu = di.inject(
      applicationMenuReactivityInjectable,
    );

    return {
      id: "stop-application-menu",
      run: async () => {
        await applicationMenu.stop();
      },
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopApplicationMenuInjectable;
