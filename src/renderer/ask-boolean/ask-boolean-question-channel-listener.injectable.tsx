/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AskBooleanQuestionChannel } from "../../common/ask-boolean/ask-boolean-question-channel.injectable";
import askBooleanQuestionChannelInjectable from "../../common/ask-boolean/ask-boolean-question-channel.injectable";
import showInfoNotificationInjectable from "../components/notifications/show-info-notification.injectable";
import { Button } from "../components/button";
import React from "react";
import { messageToChannelInjectionToken } from "../../common/utils/channel/message-to-channel-injection-token";
import askBooleanAnswerChannelInjectable from "../../common/ask-boolean/ask-boolean-answer-channel.injectable";
import notificationsStoreInjectable from "../components/notifications/notifications-store.injectable";
import type { MessageChannelListener } from "../../common/utils/channel/message-channel-listener-injection-token";
import { messageChannelListenerInjectionToken } from "../../common/utils/channel/message-channel-listener-injection-token";

const askBooleanQuestionChannelListenerInjectable = getInjectable({
  id: "ask-boolean-question-channel-listener",

  instantiate: (di): MessageChannelListener<AskBooleanQuestionChannel> => {
    const questionChannel = di.inject(askBooleanQuestionChannelInjectable);
    const showInfoNotification = di.inject(showInfoNotificationInjectable);
    const messageToChannel = di.inject(messageToChannelInjectionToken);
    const answerChannel = di.inject(askBooleanAnswerChannelInjectable);
    const notificationsStore = di.inject(notificationsStoreInjectable);

    const sendAnswerFor = (id: string) => (value: boolean) => {
      messageToChannel(answerChannel, { id, value });
    };

    const closeNotification = (notificationId: string) => {
      notificationsStore.remove(notificationId);
    };

    const sendAnswerAndCloseNotificationFor = (sendAnswer: (value: boolean) => void, notificationId: string) => (value: boolean) => () => {
      sendAnswer(value);
      closeNotification(notificationId);
    };

    return {
      channel: questionChannel,

      handler: ({ id: questionId, title, question }) => {
        const notificationId = `ask-boolean-for-${questionId}`;

        const sendAnswer = sendAnswerFor(questionId);
        const sendAnswerAndCloseNotification = sendAnswerAndCloseNotificationFor(sendAnswer, notificationId);

        showInfoNotification(
          <AskBoolean
            id={questionId}
            title={title}
            message={question}
            onNo={sendAnswerAndCloseNotification(false)}
            onYes={sendAnswerAndCloseNotification(true)}
          />,

          {
            id: notificationId,
            timeout: 0,
            onClose: () => sendAnswer(false),
          },
        );
      },
    };
  },

  injectionToken: messageChannelListenerInjectionToken,
});

export default askBooleanQuestionChannelListenerInjectable;

const AskBoolean = ({
  id,
  title,
  message,
  onNo,
  onYes,
}: {
  id: string;
  title: string;
  message: string;
  onNo: () => void;
  onYes: () => void;
}) => (
  <div className="flex column gaps" data-testid={`ask-boolean-${id}`}>
    <b>{title}</b>
    <p>{message}</p>

    <div className="flex gaps row align-left box grow">
      <Button
        light
        label="Yes"
        onClick={onYes}
        data-testid={`ask-boolean-${id}-button-yes`}
      />

      <Button
        active
        outlined
        label="No"
        data-testid={`ask-boolean-${id}-button-no`}
        onClick={onNo}
      />
    </div>
  </div>
);
