/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsInjectionToken } from "../../before-frame-starts/tokens";
import buildVersionInjectable from "./build-version.injectable";

const initializeBuildVersionInjectable = getInjectable({
  id: "initialize-build-version",
  instantiate: (di) => ({
    id: "initialize-build-version",
    run: async () => {
      const buildVersion = di.inject(buildVersionInjectable);

      await buildVersion.init();
    },
  }),
  injectionToken: beforeFrameStartsInjectionToken,
});

export default initializeBuildVersionInjectable;
