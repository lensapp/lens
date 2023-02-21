/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannelSender } from "../../../common/utils/channel/message-to-channel-injection-token";
import { sendMessageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import { deepLinkingRouteAttemptChannel } from "../common/channels";

export type SendDeepLinkingAttempt = MessageChannelSender<typeof deepLinkingRouteAttemptChannel>;

const sendDeepLinkingAttemptInjectable = getInjectable({
  id: "send-deep-linking-attempt",
  instantiate: (di): SendDeepLinkingAttempt => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return (attempt) => sendMessageToChannel(deepLinkingRouteAttemptChannel, attempt);
  },
});

export default sendDeepLinkingAttemptInjectable;
