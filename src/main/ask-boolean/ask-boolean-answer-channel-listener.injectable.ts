/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AskBooleanAnswerChannel } from "../../common/ask-boolean/ask-boolean-answer-channel.injectable";
import askBooleanAnswerChannelInjectable from "../../common/ask-boolean/ask-boolean-answer-channel.injectable";
import askBooleanPromiseInjectable from "./ask-boolean-promise.injectable";
import type { MessageChannelListener } from "../../common/utils/channel/message-channel-listener-injection-token";
import { messageChannelListenerInjectionToken } from "../../common/utils/channel/message-channel-listener-injection-token";


const askBooleanAnswerChannelListenerInjectable = getInjectable({
  id: "ask-boolean-answer-channel-listener",

  instantiate: (di): MessageChannelListener<AskBooleanAnswerChannel> => ({
    channel: di.inject(askBooleanAnswerChannelInjectable),

    handler: ({ id, value }) => {
      const answerPromise = di.inject(askBooleanPromiseInjectable, id);

      answerPromise.resolve(value);
    },
  }),

  injectionToken: messageChannelListenerInjectionToken,
});

export default askBooleanAnswerChannelListenerInjectable;
