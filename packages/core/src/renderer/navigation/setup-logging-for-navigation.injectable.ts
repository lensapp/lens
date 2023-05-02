/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { beforeFrameStartsSecondInjectionToken } from "../before-frame-starts/tokens";
import { observableHistoryInjectionToken } from "@k8slens/routing";

const setupLoggingForNavigationInjectable = getInjectable({
  id: "setup-logging-for-navigation",
  instantiate: (di) => ({
    run: () => {
      const logger = di.inject(loggerInjectionToken);
      const observableHistory = di.inject(observableHistoryInjectionToken);

      observableHistory.listen((location, action) => {
        const isClusterView = !process.isMainFrame;
        const domain = global.location.href;

        logger.debug(`[NAVIGATION]: ${action}-ing. Current is now:`, {
          isClusterView,
          domain,
          location,
        });
      });
    },
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default setupLoggingForNavigationInjectable;
