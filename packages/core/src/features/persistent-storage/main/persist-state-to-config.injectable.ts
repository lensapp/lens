/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { persistStateToConfigInjectionToken } from "../common/save-to-file";

const persistStateToConfigInjectable = getInjectable({
  id: "persist-state-to-config",
  instantiate: (di) => {
    const logger = di.inject(loggerInjectionToken);

    return (config, state) => {
      logger.info(`[BASE-STORE]: saving ${config.path}...`);

      for (const [key, value] of Object.entries(state)) {
        config.set(key, value);
      }
    };
  },
  injectionToken: persistStateToConfigInjectionToken,
});

export default persistStateToConfigInjectable;
