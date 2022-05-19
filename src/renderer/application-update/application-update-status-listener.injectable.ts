/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { channelListenerInjectionToken } from "../../common/channel/channel-listener-injection-token";
import type { ApplicationUpdateStatusEventId } from "../../common/application-update/application-update-status-channel.injectable";
import applicationUpdateStatusChannelInjectable from "../../common/application-update/application-update-status-channel.injectable";
import showInfoNotificationInjectable from "../components/notifications/show-info-notification.injectable";

const applicationUpdateStatusListenerInjectable = getInjectable({
  id: "application-update-status-listener",

  instantiate: (di) => {
    const channel = di.inject(applicationUpdateStatusChannelInjectable);
    const showInfoNotification = di.inject(showInfoNotificationInjectable);

    const eventHandlers: Record<ApplicationUpdateStatusEventId, { handle: (version: string) => void }> = {
      "checking-for-updates": {
        handle: () => {
          showInfoNotification("Checking for updates...");
        },
      },

      "no-updates-available": {
        handle: () => {
          showInfoNotification("No new updates available");
        },
      },

      "download-for-update-started": {
        handle: (version) => {
          showInfoNotification(`Download for version ${version} started...`);
        },
      },

      "download-for-update-failed": {
        handle: () => {
          showInfoNotification("Download of update failed");
        },
      },
    };

    return {
      channel,

      handler: ({ eventId, version }: { eventId: ApplicationUpdateStatusEventId; version: string }) => {
        eventHandlers[eventId].handle(version);
      },
    };
  },

  injectionToken: channelListenerInjectionToken,
});

export default applicationUpdateStatusListenerInjectable;
