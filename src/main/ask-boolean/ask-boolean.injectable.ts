/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { messageToChannelInjectionToken } from "../../common/utils/channel/message-to-channel-injection-token";
import askBooleanQuestionChannelInjectable from "../../common/ask-boolean/ask-boolean-question-channel.injectable";
import askBooleanPromiseInjectable from "./ask-boolean-promise.injectable";
import getRandomIdInjectable from "../../common/utils/get-random-id.injectable";

export type AskBoolean = ({
  title,
  question,
}: {
  title: string;
  question: string;
}) => Promise<boolean>;

const askBooleanInjectable = getInjectable({
  id: "ask-boolean",

  instantiate: (di): AskBoolean => {
    const messageToChannel = di.inject(messageToChannelInjectionToken);
    const askBooleanChannel = di.inject(askBooleanQuestionChannelInjectable);
    const getRandomId = di.inject(getRandomIdInjectable);

    return async ({ title, question }) => {
      const id = getRandomId();

      const returnValuePromise = di.inject(askBooleanPromiseInjectable, id);

      await messageToChannel(askBooleanChannel, { id, title, question });

      return await returnValuePromise.promise;
    };
  },
});

export default askBooleanInjectable;
