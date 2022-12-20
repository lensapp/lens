/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../common/logger.injectable";
import { beforeFrameStartsInjectionToken } from "../before-frame-starts/tokens";
import observableHistoryInjectable from "./observable-history.injectable";

const setupLoggingForNavigationInjectable = getInjectable({
  id: "setup-logging-for-navigation",
  instantiate: (di) => ({
    id: "setup-logging-for-navigation",
    run: () => {
      const logger = di.inject(loggerInjectable);
      const observableHistory = di.inject(observableHistoryInjectable);

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
  injectionToken: beforeFrameStartsInjectionToken,
});

export default setupLoggingForNavigationInjectable;
