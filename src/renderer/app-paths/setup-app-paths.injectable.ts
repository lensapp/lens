/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appPathsStateInjectable from "../../common/app-paths/app-paths-state.injectable";
import { beforeFrameStartsInjectionToken } from "../before-frame-starts/before-frame-starts-injection-token";
import appPathsChannelInjectable from "../../common/app-paths/app-paths-channel.injectable";
import { requestFromChannelInjectionToken } from "../../common/utils/channel/request-from-channel-injection-token";

const setupAppPathsInjectable = getInjectable({
  id: "setup-app-paths",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);
    const appPathsChannel = di.inject(appPathsChannelInjectable);
    const appPathsState = di.inject(appPathsStateInjectable);

    return {
      run: async () => {
        const appPaths = await requestFromChannel(
          appPathsChannel,
        );

        appPathsState.set(appPaths);
      },
    };
  },

  injectionToken: beforeFrameStartsInjectionToken,
});

export default setupAppPathsInjectable;
