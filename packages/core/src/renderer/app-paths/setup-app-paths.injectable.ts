/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appPathsStateInjectable from "../../common/app-paths/app-paths-state.injectable";
import { appPathsChannel } from "../../common/app-paths/app-paths-channel";
import { requestFromChannelInjectionToken } from "@k8slens/messaging";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";

const setupAppPathsInjectable = getInjectable({
  id: "setup-app-paths",

  instantiate: (di) => ({
    run: async () => {
      const requestFromChannel = di.inject(requestFromChannelInjectionToken);
      const appPathsState = di.inject(appPathsStateInjectable);
      const appPaths = await requestFromChannel(appPathsChannel);

      appPathsState.set(appPaths);
    },
  }),

  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default setupAppPathsInjectable;
