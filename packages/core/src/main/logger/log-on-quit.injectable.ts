/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { onQuitOfBackEndInjectionToken } from "../start-main-application/runnable-tokens/phases";

const logOnQuitOfBackendInjectable = getInjectable({
  id: "log-on-quit-of-backend",
  instantiate: (di) => ({
    run: () => {
      const logger = di.inject(loggerInjectionToken);

      logger.info("Quitting application ...");
    },
  }),
  injectionToken: onQuitOfBackEndInjectionToken,
});

export default logOnQuitOfBackendInjectable;
