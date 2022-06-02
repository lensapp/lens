/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannel } from "../utils/channel/message-channel-injection-token";
import { messageChannelInjectionToken } from "../utils/channel/message-channel-injection-token";

export type AskBooleanAnswerChannel = MessageChannel<{ id: string; value: boolean }>;

const askBooleanAnswerChannelInjectable = getInjectable({
  id: "ask-boolean-answer-channel",

  instantiate: (): AskBooleanAnswerChannel => ({
    id: "ask-boolean-answer",
  }),

  injectionToken: messageChannelInjectionToken,
});

export default askBooleanAnswerChannelInjectable;
