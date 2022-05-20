/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Channel } from "../channel/channel-injection-token";
import { channelInjectionToken } from "../channel/channel-injection-token";
import { IpcRendererNavigationEvents } from "../../renderer/navigation/events";

export type ClusterFrameNavigationChannel = Channel<string, never>;

const clusterFrameNavigationChannelInjectable = getInjectable({
  id: "cluster-frame-navigation-channel",

  instantiate: (): ClusterFrameNavigationChannel => ({
    id: IpcRendererNavigationEvents.NAVIGATE_IN_CLUSTER,
  }),

  injectionToken: channelInjectionToken,
});

export default clusterFrameNavigationChannelInjectable;
