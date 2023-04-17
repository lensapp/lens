/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import buildSemanticVersionInjectable from "../../../common/vars/build-semantic-version.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import { buildVersionInitializationInjectable } from "../../../features/vars/build-version/main/init.injectable";

const initSemanticBuildVersionInjectable = getInjectable({
  id: "init-semantic-build-version",
  instantiate: (di) => {
    return {
      run: async () => {
        const buildSemanticVersion = di.inject(buildSemanticVersionInjectable);

        await buildSemanticVersion.init();
      },
      runAfter: buildVersionInitializationInjectable,
    };
  },
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initSemanticBuildVersionInjectable;
