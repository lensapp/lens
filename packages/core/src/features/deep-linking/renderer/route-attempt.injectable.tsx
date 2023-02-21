/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageChannelListenerInjectable } from "../../../common/utils/channel/message-channel-listener-injection-token";
import showShortInfoNotificationInjectable from "../../../renderer/components/notifications/show-short-info.injectable";
import deepLinkingRouterInjectable from "./lens-protocol-router-renderer.injectable";
import { deepLinkingRouteAttemptChannel } from "../common/channels";
import Url from "url-parse";
import React from "react";
import { foldAttemptResults, RouteAttempt } from "../../../common/protocol-handler";

const deepLinkingRouteAttemptListenerInjectable = getMessageChannelListenerInjectable({
  channel: deepLinkingRouteAttemptChannel,
  id: "main",
  handler: (di) => {
    const router = di.inject(deepLinkingRouterInjectable);
    const showShortInfoNotification = di.inject(showShortInfoNotificationInjectable);

    return async (attempt) => {
      const url = new Url(attempt.url, true);
      const currentAttempt = attempt.target === "internal"
        ? router.routeToInternal(url)
        : await router.routeToExtension(url);

      switch (foldAttemptResults(attempt.previous, currentAttempt)) {
        case RouteAttempt.MISSING:
          showShortInfoNotification((
            <p>
              {"Unknown action "}
              <code>{attempt.url}</code>
              {". Are you on the latest version of the extension?"}
            </p>
          ));
          break;
        case RouteAttempt.MISSING_EXTENSION:
          showShortInfoNotification((
            <p>
              {"Missing extension for action "}
              <code>{attempt.url}</code>
              {". Not able to find extension in our known list. Try installing it manually."}
            </p>
          ));
          break;
      }
    };
  },
});

export default deepLinkingRouteAttemptListenerInjectable;
