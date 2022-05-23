/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Channel } from "../channel/channel-injection-token";
import { channelInjectionToken } from "../channel/channel-injection-token";
import { IpcRendererNavigationEvents } from "../../renderer/navigation/events";

export type AppNavigationChannel = Channel<string>;

const appNavigationChannelInjectable = getInjectable({
  id: "app-navigation-channel",

  instantiate: (): AppNavigationChannel => ({
    id: IpcRendererNavigationEvents.NAVIGATE_IN_APP,
  }),

  injectionToken: channelInjectionToken,
});

export default appNavigationChannelInjectable;
