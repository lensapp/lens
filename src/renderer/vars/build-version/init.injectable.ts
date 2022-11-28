/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsInjectionToken } from "../../before-frame-starts/before-frame-starts-injection-token";
import buildVersionInjectable from "./build-version.injectable";

const initializeBuildVersionInjectable = getInjectable({
  id: "initialize-build-version",
  instantiate: (di) => {
    const buildVersion = di.inject(buildVersionInjectable);

    return {
      id: "initialize-build-version",
      run: () => buildVersion.init(),
    };
  },
  injectionToken: beforeFrameStartsInjectionToken,
});

export default initializeBuildVersionInjectable;
