/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeElectronIsReadyInjectionToken } from "../../runnable-tokens/before-electron-is-ready-injection-token";
import initializeSentryReportingWithInjectable from "../../../../common/error-reporting/initialize-sentry-reporting.injectable";
import initializeSentryOnMainInjectable from "./initialize-on-main.injectable";

const setupSentryInjectable = getInjectable({
  id: "setup-sentry",
  instantiate: (di) => {
    const initializeSentryReportingWith = di.inject(initializeSentryReportingWithInjectable);
    const initializeSentryOnMain = di.inject(initializeSentryOnMainInjectable);

    return {
      run: () => initializeSentryReportingWith(initializeSentryOnMain),
    };
  },
  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupSentryInjectable;
