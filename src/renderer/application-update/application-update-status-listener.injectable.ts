/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ApplicationUpdateStatusChannel, ApplicationUpdateStatusEventId } from "../../common/application-update/application-update-status-channel.injectable";
import applicationUpdateStatusChannelInjectable from "../../common/application-update/application-update-status-channel.injectable";
import showInfoNotificationInjectable from "../components/notifications/show-info-notification.injectable";
import type { MessageChannelListener } from "../../common/utils/channel/message-channel-listener-injection-token";
import { messageChannelListenerInjectionToken } from "../../common/utils/channel/message-channel-listener-injection-token";

const applicationUpdateStatusListenerInjectable = getInjectable({
  id: "application-update-status-listener",

  instantiate: (di): MessageChannelListener<ApplicationUpdateStatusChannel> => {
    const channel = di.inject(applicationUpdateStatusChannelInjectable);
    const showInfoNotification = di.inject(showInfoNotificationInjectable);

    const eventHandlers: Record<ApplicationUpdateStatusEventId, { handle: (version?: string) => void }> = {
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

      handler: ({ eventId, version }) => {
        eventHandlers[eventId].handle(version);
      },
    };
  },

  injectionToken: messageChannelListenerInjectionToken,
});

export default applicationUpdateStatusListenerInjectable;
