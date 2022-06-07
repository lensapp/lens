/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannel } from "../utils/channel/message-channel-injection-token";
import { messageChannelInjectionToken } from "../utils/channel/message-channel-injection-token";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type AskBooleanQuestionParameters = { id: string; title: string; question: string };
export type AskBooleanQuestionChannel = MessageChannel<AskBooleanQuestionParameters>;

const askBooleanQuestionChannelInjectable = getInjectable({
  id: "ask-boolean-question-channel",

  instantiate: (): AskBooleanQuestionChannel => ({
    id: "ask-boolean-question",
  }),

  injectionToken: messageChannelInjectionToken,
});

export default askBooleanQuestionChannelInjectable;
