/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import * as path from "path";
import { beforeApplicationIsLoadingInjectionToken } from "../../start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";

const setupModulePathsInjectable = getInjectable({
  id: "setup-module-paths",

  instantiate: (di) => {
    const userDataDir = di.inject(directoryForUserDataInjectable);

    return {
      run: () => {
        const module = __non_webpack_require__("module");

        if (module?._nodeModulePaths) {
          const nodeModulePaths = module._nodeModulePaths;

          module._nodeModulePaths = (from: string[]) => {
            return nodeModulePaths(from).concat([path.join(userDataDir, "node_modules")]);
          };
        }
      },
    };
  },

  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default setupModulePathsInjectable;
