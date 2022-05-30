/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { JsonObject } from "type-fest";
import type { MessageChannel } from "../channel/message-channel-injection-token";
import { messageChannelInjectionToken } from "../channel/message-channel-injection-token";

export interface AskBooleanQuestionParameters extends JsonObject { id: string; title: string; question: string }
export type AskBooleanQuestionChannel = MessageChannel<AskBooleanQuestionParameters>;

const askBooleanQuestionChannelInjectable = getInjectable({
  id: "ask-boolean-question-channel",

  instantiate: (): AskBooleanQuestionChannel => ({
    id: "ask-boolean-question",
  }),

  injectionToken: messageChannelInjectionToken,
});

export default askBooleanQuestionChannelInjectable;
