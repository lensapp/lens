/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AppPathsChannel } from "../../common/app-paths/app-paths-channel";
import appPathsInjectable from "../../common/app-paths/app-paths.injectable";
import type { RequestChannelHandler } from "../../common/utils/channel/request-channel-listener-injection-token";

const appPathsChannelHandlerInjectable = getInjectable({
  id: "app-paths-channel-handler",
  instantiate: (di): RequestChannelHandler<AppPathsChannel> => {
    const appPaths = di.inject(appPathsInjectable);

    return () => appPaths;
  },
});

export default appPathsChannelHandlerInjectable;
