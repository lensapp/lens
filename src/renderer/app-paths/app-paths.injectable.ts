/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { AppPaths, appPathsInjectionToken, appPathsIpcChannel } from "../../common/app-paths/app-path-injection-token";
import getValueFromRegisteredChannelInjectable from "./get-value-from-registered-channel/get-value-from-registered-channel.injectable";

let syncAppPaths: AppPaths;

const appPathsInjectable = getInjectable({
  id: "app-paths",

  setup: async (di) => {
    const getValueFromRegisteredChannel = await di.inject(
      getValueFromRegisteredChannelInjectable,
    );

    syncAppPaths = await getValueFromRegisteredChannel(appPathsIpcChannel);
  },

  instantiate: () => syncAppPaths,

  injectionToken: appPathsInjectionToken,
});

export default appPathsInjectable;
