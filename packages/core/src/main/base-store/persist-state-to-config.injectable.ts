/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { persistStateToConfigInjectionToken } from "../../common/base-store/save-to-file";
import loggerInjectable from "../../common/logger.injectable";

const persistStateToConfigInjectable = getInjectable({
  id: "persist-state-to-config",
  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);

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
