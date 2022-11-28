/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appPathsStateInjectable from "../../common/app-paths/app-paths-state.injectable";
import { beforeFrameStartsInjectionToken } from "../before-frame-starts/before-frame-starts-injection-token";
import { appPathsChannel } from "../../common/app-paths/app-paths-channel";
import { requestFromChannelInjectionToken } from "../../common/utils/channel/request-from-channel-injection-token";

const setupAppPathsInjectable = getInjectable({
  id: "setup-app-paths",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);
    const appPathsState = di.inject(appPathsStateInjectable);

    return {
      id: "setup-app-paths",
      run: async () => {
        const appPaths = await requestFromChannel(appPathsChannel);

        appPathsState.set(appPaths);
      },
    };
  },

  injectionToken: beforeFrameStartsInjectionToken,
});

export default setupAppPathsInjectable;
