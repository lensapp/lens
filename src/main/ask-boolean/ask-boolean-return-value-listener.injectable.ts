/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { channelListenerInjectionToken } from "../../common/channel/channel-listener-injection-token";
import askBooleanAnswerChannelInjectable from "../../common/ask-boolean/ask-boolean-answer-channel.injectable";
import askBooleanPromiseInjectable from "./ask-boolean-promise.injectable";

const askBooleanReturnValueListenerInjectable = getInjectable({
  id: "ask-boolean-return-value-listener",

  instantiate: (di) => ({
    channel: di.inject(askBooleanAnswerChannelInjectable),

    handler: ({ id, value }) => {
      const returnValuePromise = di.inject(askBooleanPromiseInjectable, id);

      returnValuePromise.resolve(value);
    },
  }),

  injectionToken: channelListenerInjectionToken,
});

export default askBooleanReturnValueListenerInjectable;
