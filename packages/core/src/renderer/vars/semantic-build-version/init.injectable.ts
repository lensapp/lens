/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import buildSemanticVersionInjectable from "../../../common/vars/build-semantic-version.injectable";
import { buildVersionInitializationInjectable } from "../../../features/vars/build-version/renderer/init.injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";

const initSemanticBuildVersionInjectable = getInjectable({
  id: "init-semantic-build-version",
  instantiate: (di) => ({
    run: async () => {
      const buildSemanticVersion = di.inject(buildSemanticVersionInjectable);

      await buildSemanticVersion.init();
    },
    runAfter: buildVersionInitializationInjectable,
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default initSemanticBuildVersionInjectable;
