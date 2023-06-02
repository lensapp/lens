/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageChannelListenerInjectable } from "@k8slens/messaging";
import { showErrorNotificationInjectable } from "@k8slens/notifications";
import { shellSyncFailedChannel } from "../common/failure-channel";

const shellSyncFailureListenerInjectable = getMessageChannelListenerInjectable({
  id: "notification",
  channel: shellSyncFailedChannel,
  getHandler: (di) => {
    const showErrorNotification = di.inject(showErrorNotificationInjectable);

    return (errorMessage) => showErrorNotification(`Failed to sync shell environment: ${errorMessage}`);
  },
});

export default shellSyncFailureListenerInjectable;
