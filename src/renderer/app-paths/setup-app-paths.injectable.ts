/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { appPathsIpcChannel } from "../../common/app-paths/app-path-injection-token";
import getValueFromRegisteredChannelInjectable from "./get-value-from-registered-channel/get-value-from-registered-channel.injectable";
import appPathsStateInjectable from "../../common/app-paths/app-paths-state.injectable";
import { beforeFrameStartsInjectionToken } from "../before-frame-starts/before-frame-starts-injection-token";

const setupAppPathsInjectable = getInjectable({
  id: "setup-app-paths",

  instantiate: (di) => ({
    run: async () => {
      const getValueFromRegisteredChannel = di.inject(
        getValueFromRegisteredChannelInjectable,
      );

      const syncAppPaths = await getValueFromRegisteredChannel(appPathsIpcChannel);

      const appPathsState = di.inject(appPathsStateInjectable);

      appPathsState.set(syncAppPaths);
    },
  }),

  injectionToken: beforeFrameStartsInjectionToken,
});

export default setupAppPathsInjectable;
