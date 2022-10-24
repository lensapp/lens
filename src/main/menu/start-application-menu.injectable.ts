/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuInjectable from "./application-menu.injectable";
import { onLoadOfApplicationInjectionToken } from "../start-main-application/runnable-tokens/on-load-of-application-injection-token";

const startApplicationMenuInjectable = getInjectable({
  id: "start-application-menu",

  instantiate: (di) => {
    const applicationMenu = di.inject(
      applicationMenuInjectable,
    );

    return {
      id: "start-application-menu",
      run: async () => {
        await applicationMenu.start();
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startApplicationMenuInjectable;
