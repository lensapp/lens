/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Channel } from "../channel/channel-injection-token";
import { channelInjectionToken } from "../channel/channel-injection-token";

export type ApplicationUpdateStatusEventId =
      | "checking-for-updates"
      | "no-updates-available"
      | "download-for-update-started"
      | "download-for-update-failed";

export interface ApplicationUpdateStatusChannelMessage { eventId: ApplicationUpdateStatusEventId; version?: string }
export type ApplicationUpdateStatusChannel = Channel<ApplicationUpdateStatusChannelMessage>;

const applicationUpdateStatusChannelInjectable = getInjectable({
  id: "application-update-status-channel",

  instantiate: (): ApplicationUpdateStatusChannel => ({
    id: "application-update-status-channel",
  }),

  injectionToken: channelInjectionToken,
});

export default applicationUpdateStatusChannelInjectable;
