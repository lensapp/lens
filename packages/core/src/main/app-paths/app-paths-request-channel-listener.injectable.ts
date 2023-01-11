/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { appPathsChannel } from "../../common/app-paths/app-paths-channel";
import appPathsInjectable from "../../common/app-paths/app-paths.injectable";
import { getRequestChannelListenerInjectable } from "../utils/channel/channel-listeners/listener-tokens";

const appPathsRequestChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: appPathsChannel,
  handler: (di) => {
    const appPaths = di.inject(appPathsInjectable);

    return () => appPaths;
  },
});

export default appPathsRequestChannelListenerInjectable;
