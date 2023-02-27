/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";
import injectSystemCAsInjectable from "../../../features/certificate-authorities/common/inject-system-cas.injectable";

const setupSystemCaInjectable = getInjectable({
  id: "setup-system-ca",
  instantiate: (di) => ({
    run: async () => {
      const injectSystemCAs = di.inject(injectSystemCAsInjectable);

      await injectSystemCAs();
    },
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default setupSystemCaInjectable;
