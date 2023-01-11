/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageChannelListenerInjectable } from "../../../common/utils/channel/message-channel-listener-injection-token";
import showErrorNotificationInjectable from "../../../renderer/components/notifications/show-error-notification.injectable";
import { shellSyncFailedChannel } from "../common/failure-channel";

const shellSyncFailureListenerInjectable = getMessageChannelListenerInjectable({
  id: "notification",
  channel: shellSyncFailedChannel,
  handler: (di) => {
    const showErrorNotification = di.inject(showErrorNotificationInjectable);

    return (errorMessage) => showErrorNotification(`Failed to sync shell environment: ${errorMessage}`);
  },
});

export default shellSyncFailureListenerInjectable;
