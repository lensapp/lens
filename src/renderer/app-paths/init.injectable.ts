/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsInjectionToken } from "../before-frame-starts/before-frame-starts-injection-token";
import appPathsInjectable from "./impl.injectable";

const initAppPathsInjectable = getInjectable({
  id: "init-app-paths",
  instantiate: (di) => {
    const appPaths = di.inject(appPathsInjectable);

    return {
      id: "init-app-paths",
      run: () => appPaths.init(),
    };
  },
  injectionToken: beforeFrameStartsInjectionToken,
});

export default initAppPathsInjectable;
