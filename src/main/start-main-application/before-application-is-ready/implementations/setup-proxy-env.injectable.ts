/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { mangleProxyEnv } from "../../../proxy-env";
import { beforeApplicationIsReadyInjectionToken } from "../before-application-is-ready-injection-token";

const setupProxyEnvInjectable = getInjectable({
  id: "setup-proxy-env",

  instantiate: () => ({
    run: () => {
      mangleProxyEnv();
    },
  }),

  injectionToken: beforeApplicationIsReadyInjectionToken,
});

export default setupProxyEnvInjectable;
