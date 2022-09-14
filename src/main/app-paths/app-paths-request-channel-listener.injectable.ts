/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { appPathsChannel } from "../../common/app-paths/app-paths-channel";
import { getRequestChannelListenerInjectable } from "../utils/channel/channel-listeners/listener-tokens";
import appPathsInjectable from "./impl.injectable";

const appPathsRequestChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: appPathsChannel,
  handler: (di) => {
    const appPaths = di.inject(appPathsInjectable);

    return () => appPaths.get();
  },
});

export default appPathsRequestChannelListenerInjectable;
