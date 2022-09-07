/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { init } from "@sentry/electron/main";
import { beforeElectronIsReadyInjectionToken } from "../runnable-tokens/before-electron-is-ready-injection-token";
import initializeSentryReportingWithInjectable from "../../../common/error-reporting/initialize-sentry-reporting.injectable";

const setupSentryInjectable = getInjectable({
  id: "setup-sentry",
  instantiate: (di) => {
    const initializeSentryReportingWith = di.inject(initializeSentryReportingWithInjectable);

    return {
      run: () => initializeSentryReportingWith(init),
    };
  },
  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupSentryInjectable;
