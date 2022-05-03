/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shellSync } from "../../shell-sync";
import loggerInjectable from "../../../common/logger.injectable";
import { whenApplicationIsLoadingInjectionToken } from "../runnable-tokens/when-application-is-loading-injection-token";

const setupShellInjectable = getInjectable({
  id: "setup-shell",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);

    return {
      run: async () => {
        logger.info("🐚 Syncing shell environment");

        await shellSync();
      },
    };
  },

  injectionToken: whenApplicationIsLoadingInjectionToken,
  causesSideEffects: true,
});

export default setupShellInjectable;
