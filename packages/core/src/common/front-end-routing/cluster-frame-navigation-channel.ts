/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { IpcRendererNavigationEvents } from "../../renderer/navigation/events";
import type { MessageChannel } from "../utils/channel/message-channel-listener-injection-token";

export type ClusterFrameNavigationChannel = MessageChannel<string>;

export const clusterFrameNavigationChannel: ClusterFrameNavigationChannel = {
  id: IpcRendererNavigationEvents.NAVIGATE_IN_CLUSTER,
};
