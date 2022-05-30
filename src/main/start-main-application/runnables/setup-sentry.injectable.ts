/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { initializeSentryReporting } from "../../../common/sentry";
import { init } from "@sentry/electron/main";
import { beforeApplicationIsLoadingInjectionToken } from "../runnable-tokens/before-application-is-loading-injection-token";

const setupSentryInjectable = getInjectable({
  id: "setup-sentry",

  instantiate: () => ({
    run: () => {
      initializeSentryReporting(init);
    },
  }),

  causesSideEffects: true,

  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default setupSentryInjectable;
