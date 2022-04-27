/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { AppPaths, appPathsIpcChannel } from "../../common/app-paths/app-path-injection-token";
import getValueFromRegisteredChannelInjectable from "./get-value-from-registered-channel/get-value-from-registered-channel.injectable";
import appPathsStateInjectable from "../../common/app-paths/app-paths-state.injectable";
import { onApplicationIsReadyInjectionToken } from "../../main/start-main-application/on-application-is-ready/on-application-is-ready-injection-token";

let syncAppPaths: AppPaths;

const setupAppPathsInjectable = getInjectable({
  id: "setup-app-paths",

  instantiate: (di) => ({
    run: async () => {
      const getValueFromRegisteredChannel = di.inject(
        getValueFromRegisteredChannelInjectable,
      );

      syncAppPaths = await getValueFromRegisteredChannel(appPathsIpcChannel);

      const appPathsState = di.inject(appPathsStateInjectable);

      appPathsState.set(syncAppPaths);
    },
  }),

  injectionToken: onApplicationIsReadyInjectionToken,
});

export default setupAppPathsInjectable;
