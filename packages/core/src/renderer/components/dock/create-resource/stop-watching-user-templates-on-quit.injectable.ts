/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../../../main/start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";
import userTemplatesInjectable from "./user-templates.injectable";

const stopWatchingUserTemplatesOnQuitInjectable = getInjectable({
  id: "stop-watching-user-templates-on-quit",

  instantiate: (di) => {

    return {
      id: "stop-watching-user-templates-on-quit",

      run: () => {
        const [, disposer] = di.inject(userTemplatesInjectable);

        disposer();
      },
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopWatchingUserTemplatesOnQuitInjectable;
