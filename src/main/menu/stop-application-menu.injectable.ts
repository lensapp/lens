/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuInjectable from "./application-menu.injectable";
import { onApplicationHardQuitInjectionToken } from "../start-main-application/on-application-hard-quit/on-application-hard-quit-injection-token";

const stopApplicationMenuInjectable = getInjectable({
  id: "stop-application-menu",

  instantiate: (di) => {
    const applicationMenu = di.inject(
      applicationMenuInjectable,
    );

    return {
      run: () => {
        applicationMenu.stop();
      },
    };
  },

  injectionToken: onApplicationHardQuitInjectionToken,
});

export default stopApplicationMenuInjectable;
