/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../../../main/start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";
import userTemplatesInjectable from "./user-templates.injectable";
import loggerInjectable from "../../../../common/logger.injectable";

const stopWatchingUserTemplatesOnQuitInjectable = getInjectable({
  id: "stop-watching-user-templates-on-quit",

  instantiate: (di) => {

    return {
      id: "stop-watching-user-templates-on-quit",

      run: async () => {
        const [, watcher] = di.inject(userTemplatesInjectable);
        const logger = di.inject(loggerInjectable);

        logger.info("[USER-CREATE-RESOURCE-TEMPLATES]: stopping watch");
  
        await watcher?.close();
      },
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopWatchingUserTemplatesOnQuitInjectable;
