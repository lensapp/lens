/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannelSender } from "../../../common/utils/channel/message-to-channel-injection-token";
import { sendMessageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import { invalidDeepLinkingAttemptChannel } from "../common/channels";

export type SendInvalidDeepLinkingAttempt = MessageChannelSender<typeof invalidDeepLinkingAttemptChannel>;

const sendInvalidDeepLinkingAttemptInjectable = getInjectable({
  id: "send-invalid-deep-linking-attempt",
  instantiate: (di): SendInvalidDeepLinkingAttempt => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return (attempt) => sendMessageToChannel(invalidDeepLinkingAttemptChannel, attempt);
  },
});

export default sendInvalidDeepLinkingAttemptInjectable;
