/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { appPathsInjectionChannelToken } from "../../common/app-paths/app-path-channel-injection-token";
import { appPathsInjectionToken } from "../../common/app-paths/app-path-injection-token";
import type { AppPaths } from "../../common/app-paths/app-paths";

let syncAppPaths: AppPaths;

const appPathsInjectable = getInjectable({
  setup: async (di) => {
    const appPathsChannel = di.inject(appPathsInjectionChannelToken);

    syncAppPaths = await appPathsChannel();
  },
  instantiate: () => syncAppPaths,
  injectionToken: appPathsInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default appPathsInjectable;
