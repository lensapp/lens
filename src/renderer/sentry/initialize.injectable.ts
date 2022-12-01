/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import initializeSentryReportingWithInjectable from "../../common/error-reporting/initialize-sentry-reporting.injectable";
import setupAppPathsInjectable from "../app-paths/setup-app-paths.injectable";
import { beforeFrameStartsInjectionToken } from "../before-frame-starts/before-frame-starts-injection-token";
import { init } from "@sentry/electron/renderer";

const initializeSentryReportingInjectable = getInjectable({
  id: "initialize-sentry-reporting",
  instantiate: (di) => ({
    id: "initialize-sentry-reporting",
    run: () => {
      // Have to inject this here instead of above so that its dependency on `setupAppPathsInjectable` doesn't throw
      const initializeSentryReportingWith = di.inject(initializeSentryReportingWithInjectable);

      if (process.isMainFrame) {
        initializeSentryReportingWith(init);
      }
    },
    runAfter: di.inject(setupAppPathsInjectable),
  }),
  injectionToken: beforeFrameStartsInjectionToken,
});

export default initializeSentryReportingInjectable;
