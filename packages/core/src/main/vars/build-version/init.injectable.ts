/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import buildVersionInjectable from "./build-version.injectable";

const initializeBuildVersionInjectable = getInjectable({
  id: "initialize-build-version",
  instantiate: (di) => ({
    run: async () => {
      const buildVersion = di.inject(buildVersionInjectable);

      await buildVersion.init();
    },
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initializeBuildVersionInjectable;
