/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { injectSystemCAs } from "../../../common/system-ca";
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../runnable-tokens/before-application-is-loading-injection-token";

const setupSystemCaInjectable = getInjectable({
  id: "setup-system-ca",

  instantiate: () => ({
    id: "setup-system-ca",
    run: async () => {
      await injectSystemCAs();
    },
  }),

  causesSideEffects: true,

  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default setupSystemCaInjectable;
