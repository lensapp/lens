/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { channelListenerInjectionToken } from "../../common/channel/channel-listener-injection-token";
import askBooleanAnswerChannelInjectable from "../../common/ask-boolean/ask-boolean-answer-channel.injectable";
import askBooleanPromiseInjectable from "./ask-boolean-promise.injectable";

const askBooleanAnswerChannelListenerInjectable = getInjectable({
  id: "ask-boolean-answer-channel-listener",

  instantiate: (di) => ({
    channel: di.inject(askBooleanAnswerChannelInjectable),

    handler: ({ id, value }) => {
      const answerPromise = di.inject(askBooleanPromiseInjectable, id);

      answerPromise.resolve(value);
    },
  }),

  injectionToken: channelListenerInjectionToken,
});

export default askBooleanAnswerChannelListenerInjectable;
