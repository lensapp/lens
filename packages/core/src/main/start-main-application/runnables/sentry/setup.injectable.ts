/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";
import initializeSentryReportingWithInjectable from "../../../../common/error-reporting/initialize-sentry-reporting.injectable";
import initializeSentryOnMainInjectable from "./initialize-on-main.injectable";

const setupSentryInjectable = getInjectable({
  id: "setup-sentry",
  instantiate: (di) => ({
    run: () => {
      const initializeSentryReportingWith = di.inject(initializeSentryReportingWithInjectable);
      const initializeSentryOnMain = di.inject(initializeSentryOnMainInjectable);

      initializeSentryReportingWith(initializeSentryOnMain);

      return undefined;
    },
  }),
  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupSentryInjectable;
