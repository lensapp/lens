/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { IpcRendererNavigationEvents } from "../../renderer/navigation/events";
import type { MessageChannel } from "../utils/channel/message-channel-injection-token";
import { messageChannelInjectionToken } from "../utils/channel/message-channel-injection-token";

export type ClusterFrameNavigationChannel = MessageChannel<string>;

const clusterFrameNavigationChannelInjectable = getInjectable({
  id: "cluster-frame-navigation-channel",

  instantiate: (): ClusterFrameNavigationChannel => ({
    id: IpcRendererNavigationEvents.NAVIGATE_IN_CLUSTER,
  }),

  injectionToken: messageChannelInjectionToken,
});

export default clusterFrameNavigationChannelInjectable;
