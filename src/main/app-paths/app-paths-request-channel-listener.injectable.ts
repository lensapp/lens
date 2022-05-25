/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { requestChannelListenerInjectionToken } from "../../common/channel/request-channel-listener-injection-token";
import appPathsChannelInjectable from "../../common/app-paths/app-paths-channel.injectable";
import appPathsInjectable from "../../common/app-paths/app-paths.injectable";

const appPathsRequestChannelListenerInjectable = getInjectable({
  id: "app-paths-request-channel-listener",

  instantiate: (di) => {
    const channel = di.inject(appPathsChannelInjectable);
    const appPaths = di.inject(appPathsInjectable);

    return ({
      channel,
      handler: () => appPaths,
    });
  },
  injectionToken: requestChannelListenerInjectionToken,
});

export default appPathsRequestChannelListenerInjectable;
