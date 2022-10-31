/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appPathsStateInjectable from "../../common/app-paths/app-paths-state.injectable";
import { beforeFrameStartsFirstInjectionToken } from "../before-frame-starts/tokens";
import { appPathsChannel } from "../../common/app-paths/app-paths-channel";
import requestFromChannelInjectable from "../utils/channel/request-from-channel.injectable";

const setupAppPathsInjectable = getInjectable({
  id: "setup-app-paths",
  instantiate: (di) => ({
    id: "setup-app-paths",
    run: async () => {
      const requestFromChannel = di.inject(requestFromChannelInjectable);
      const appPathsState = di.inject(appPathsStateInjectable);
      const appPaths = await requestFromChannel(appPathsChannel);

      appPathsState.set(appPaths);
    },
  }),

  injectionToken: beforeFrameStartsFirstInjectionToken,
});

export default setupAppPathsInjectable;
