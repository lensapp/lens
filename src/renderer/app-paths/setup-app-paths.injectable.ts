/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { AppPaths, appPathsIpcChannel } from "../../common/app-paths/app-path-injection-token";
import getValueFromRegisteredChannelInjectable from "./get-value-from-registered-channel/get-value-from-registered-channel.injectable";
import { setupableInjectionToken } from "../../common/setupable-injection-token/setupable-injection-token";
import appPathsStateInjectable from "../../common/app-paths/app-paths-state.injectable";

let syncAppPaths: AppPaths;

const setupAppPathsInjectable = getInjectable({
  id: "setup-app-paths",

  instantiate: (di) => ({
    runSetup: async () => {
      const getValueFromRegisteredChannel = di.inject(
        getValueFromRegisteredChannelInjectable,
      );

      syncAppPaths = await getValueFromRegisteredChannel(appPathsIpcChannel);

      const appPathsState = di.inject(appPathsStateInjectable);

      appPathsState.set(syncAppPaths);
    },
  }),

  injectionToken: setupableInjectionToken,
});

export default setupAppPathsInjectable;
