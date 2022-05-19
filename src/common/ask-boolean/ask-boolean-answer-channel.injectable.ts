/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Channel } from "../channel/channel-injection-token";
import { channelInjectionToken } from "../channel/channel-injection-token";

type AskBooleanAnswerChannel = Channel<{ id: string; value: boolean }>;

const askBooleanAnswerChannelInjectable = getInjectable({
  id: "ask-boolean-answer-channel",

  instantiate: (): AskBooleanAnswerChannel => ({
    id: "ask-boolean-answer",
  }),

  injectionToken: channelInjectionToken,
});

export default askBooleanAnswerChannelInjectable;
