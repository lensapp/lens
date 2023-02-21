/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { getMessageChannelListenerInjectable } from "../../../common/utils/channel/message-channel-listener-injection-token";
import showErrorNotificationInjectable from "../../../renderer/components/notifications/show-error-notification.injectable";
import { invalidDeepLinkingAttemptChannel } from "../common/channels";

const invalidRouteAttemptListenerInjectable = getMessageChannelListenerInjectable({
  channel: invalidDeepLinkingAttemptChannel,
  id: "main",
  handler: (di) => {
    const showErrorNotification = di.inject(showErrorNotificationInjectable);

    return (attempt) => void showErrorNotification((
      <>
        <p>
          {"Failed to route "}
          <code>{attempt.url}</code>
          .
        </p>
        <p>
          <b>Error:</b>
          {" "}
          {attempt.error}
        </p>
      </>
    ));
  },
});

export default invalidRouteAttemptListenerInjectable;
