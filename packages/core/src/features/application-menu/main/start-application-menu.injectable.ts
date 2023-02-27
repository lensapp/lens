/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuReactivityInjectable from "./application-menu-reactivity.injectable";
import { onLoadOfApplicationInjectionToken } from "../../../main/start-main-application/runnable-tokens/phases";

const startApplicationMenuInjectable = getInjectable({
  id: "start-application-menu",

  instantiate: (di) => ({
    run: () => {
      const applicationMenu = di.inject(applicationMenuReactivityInjectable);

      applicationMenu.start();
    },
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startApplicationMenuInjectable;
