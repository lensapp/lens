/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import buildSemanticVersionInjectable from "../../../common/vars/build-semantic-version.injectable";
import { beforeFrameStartsInjectionToken } from "../../before-frame-starts/before-frame-starts-injection-token";
import initializeBuildVersionInjectable from "../build-version/init.injectable";

const initSemanticBuildVersionInjectable = getInjectable({
  id: "init-semantic-build-version",
  instantiate: (di) => {
    const buildSemanticVersion = di.inject(buildSemanticVersionInjectable);

    return {
      run: () => buildSemanticVersion.init(),
      runAfter: di.inject(initializeBuildVersionInjectable),
    };
  },
  injectionToken: beforeFrameStartsInjectionToken,
});

export default initSemanticBuildVersionInjectable;
