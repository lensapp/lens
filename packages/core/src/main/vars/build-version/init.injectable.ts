/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../../start-main-application/runnable-tokens/before-application-is-loading-injection-token";
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
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initializeBuildVersionInjectable;
