import { getInjectable } from "@ogre-tools/injectable";
import sendToIpcInjectable from "./send-to-ipc.injectable";
import { SendMessageToChannel, sendMessageToChannelInjectionToken } from "@k8slens/messaging";
import { getMessageChannel } from "@k8slens/messaging";

type BroadcasterChannelMessage = { targetChannelId: string; message: unknown };

const broadcasterChannel = getMessageChannel<BroadcasterChannelMessage>("messaging-broadcaster-in-main");

const messageToChannelInjectable = getInjectable({
  id: "message-to-channel",

  instantiate: (di) => {
    const sendToIpc = di.inject(sendToIpcInjectable);

    return ((targetChannel, message) => {
      sendToIpc(broadcasterChannel.id, { targetChannelId: targetChannel.id, message });
    }) as SendMessageToChannel;
  },

  injectionToken: sendMessageToChannelInjectionToken,
});

export default messageToChannelInjectable;
