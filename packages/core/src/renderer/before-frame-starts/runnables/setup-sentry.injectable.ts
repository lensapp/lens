/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import initializeSentryReportingWithInjectable from "../../../common/error-reporting/initialize-sentry-reporting.injectable";
import { beforeMainFrameStartsFirstInjectionToken } from "../tokens";
import { init } from "@sentry/electron/renderer";

const setupSentryInjectable = getInjectable({
  id: "setup-sentry",
  instantiate: (di) => ({
    run: () => {
      const initializeSentryReportingWith = di.inject(initializeSentryReportingWithInjectable);

      initializeSentryReportingWith(init);
    },
  }),
  injectionToken: beforeMainFrameStartsFirstInjectionToken,
});

export default setupSentryInjectable;
