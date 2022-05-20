/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Channel } from "../channel/channel-injection-token";
import { channelInjectionToken } from "../channel/channel-injection-token";

export interface AskBooleanQuestionParameters { id: string; title: string; question: string }
export type AskBooleanQuestionChannel = Channel<AskBooleanQuestionParameters, never>;

const askBooleanQuestionChannelInjectable = getInjectable({
  id: "ask-boolean-question-channel",

  instantiate: (): AskBooleanQuestionChannel => ({
    id: "ask-boolean-question",
  }),

  injectionToken: channelInjectionToken,
});

export default askBooleanQuestionChannelInjectable;
