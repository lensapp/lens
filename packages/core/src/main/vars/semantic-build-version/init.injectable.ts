/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import buildSemanticVersionInjectable from "../../../common/vars/build-semantic-version.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import initializeBuildVersionInjectable from "../build-version/init.injectable";

const initSemanticBuildVersionInjectable = getInjectable({
  id: "init-semantic-build-version",
  instantiate: (di) => {
    const buildSemanticVersion = di.inject(buildSemanticVersionInjectable);

    return {
      run: () => buildSemanticVersion.init(),
      runAfter: initializeBuildVersionInjectable,
    };
  },
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initSemanticBuildVersionInjectable;
