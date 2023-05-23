import { getMessageChannel, getMessageChannelListenerInjectable } from "@k8slens/messaging";
import { sendMessageToChannelInjectionToken } from "@k8slens/messaging";

type BroadcasterChannelMessage = { targetChannelId: string; message: unknown };

const broadcasterChannel = getMessageChannel<BroadcasterChannelMessage>("messaging-broadcaster-in-main");

export const messageBroadcasterListenerInjectable = getMessageChannelListenerInjectable({
  id: "message-broadcaster-listener",
  channel: broadcasterChannel,

  getHandler: (di) => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return ({ targetChannelId, message }, extraData) => {
      sendMessageToChannel({ id: targetChannelId }, message, extraData);
    };
  },
});
