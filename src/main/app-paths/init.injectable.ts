/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { appPathsInjectionToken } from "../../common/app-paths/token";
import { beforeElectronIsReadyInjectionToken } from "../start-main-application/runnable-tokens/before-electron-is-ready-injection-token";

const initAppPathsInjectable = getInjectable({
  id: "init-app-paths",
  instantiate: (di) => {
    const appPaths = di.inject(appPathsInjectionToken);

    return {
      id: "init-app-paths",
      run: () => appPaths.init(),
    };
  },
  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default initAppPathsInjectable;
