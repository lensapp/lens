/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { injectSystemCAs } from "../../../common/system-ca";
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsInjectionToken } from "../../before-frame-starts/before-frame-starts-injection-token";

const setupSystemCaInjectable = getInjectable({
  id: "setup-system-ca",

  instantiate: () => ({
    run: async () => {
      await injectSystemCAs();
    },
  }),

  causesSideEffects: true,

  injectionToken: beforeFrameStartsInjectionToken,
});

export default setupSystemCaInjectable;
