import { getMessageChannel } from "@k8slens/messaging";
import { getInjectable } from "@ogre-tools/injectable";
import { sendMessageToListenersInMainInjectable } from "../send-message-to-channel/send-message-to-listeners-in-main.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application/src/start-application/time-slots";
import { enlistMessageChannelListenerInjectionToken } from "@k8slens/messaging/src/features/actual";
import { getStartableStoppable } from "@k8slens/startable-stoppable/src/get-startable-stoppable";

type BroadcasterChannelMessage = { targetChannelId: string; message: unknown };

const broadcasterChannel = getMessageChannel<BroadcasterChannelMessage>("messaging-broadcaster-in-main");

export const messageBrokerInjectable = getInjectable({
  id: "message-broker",

  instantiate: (di) => {
    const enlistMessageChannelListener = di.inject(enlistMessageChannelListenerInjectionToken);
    const sendToListenersInMain = di.inject(sendMessageToListenersInMainInjectable);

    return getStartableStoppable("message-broker", () =>
      enlistMessageChannelListener({
        id: "message-broker",
        channel: broadcasterChannel,

        handler: ({ targetChannelId, message }, electronMessageMetadata) => {
          sendToListenersInMain({ id: targetChannelId }, message, electronMessageMetadata);
        },
      }),
    );
  },
});

export const startMessageBrokerInjectable = getInjectable({
  id: "start-message-broker",

  instantiate: (di) => {
    const messageBroker = di.inject(messageBrokerInjectable);

    return {
      run: messageBroker.start,
    };
  },

  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export const stopMessageBrokerInjectable = getInjectable({
  id: "stop-message-broker",

  instantiate: (di) => {
    const messageBroker = di.inject(messageBrokerInjectable);

    return {
      run: messageBroker.stop,
    };
  },

  // Todo: extract token and start using.
  // injectionToken: onQuitOfBackEndInjectionToken,
});
