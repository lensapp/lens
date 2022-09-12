/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsInjectionToken } from "../../before-frame-starts/before-frame-starts-injection-token";
import buildVersionAsyncSyncBoxInjectable from "./box.injectable";

const initializeBuildVersionAsyncSyncBoxInjectable = getInjectable({
  id: "initialize-build-version-async-sync-box",
  instantiate: (di) => {
    const buildVersionAsyncSyncBox = di.inject(buildVersionAsyncSyncBoxInjectable);

    return {
      run: () => buildVersionAsyncSyncBox.init(),
    };
  },
  injectionToken: beforeFrameStartsInjectionToken,
});

export default initializeBuildVersionAsyncSyncBoxInjectable;
