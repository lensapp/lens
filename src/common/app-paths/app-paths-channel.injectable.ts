/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Channel } from "../channel/channel-injection-token";
import { channelInjectionToken } from "../channel/channel-injection-token";
import type { AppPaths } from "./app-path-injection-token";

export type AppPathsChannel = Channel<AppPaths, AppPaths>;

const appPathsChannelInjectable = getInjectable({
  id: "app-paths-channel",

  instantiate: (): AppPathsChannel => ({
    id: "app-paths",
  }),

  injectionToken: channelInjectionToken,
});

export default appPathsChannelInjectable;
