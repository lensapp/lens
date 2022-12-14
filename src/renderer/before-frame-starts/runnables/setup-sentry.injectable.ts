/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import initializeSentryReportingWithInjectable from "../../../common/error-reporting/initialize-sentry-reporting.injectable";
import { beforeMainFrameStartsInjectionToken } from "../tokens";
import { init } from "@sentry/electron/renderer";

const setupSentryInjectable = getInjectable({
  id: "setup-sentry",
  instantiate: (di) => ({
    id: "setup-sentry",
    run: () => {
      const initializeSentryReportingWith = di.inject(initializeSentryReportingWithInjectable);

      initializeSentryReportingWith(init);
    },
  }),
  injectionToken: beforeMainFrameStartsInjectionToken,
});

export default setupSentryInjectable;
