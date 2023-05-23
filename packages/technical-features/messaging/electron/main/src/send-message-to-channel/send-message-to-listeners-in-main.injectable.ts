import { filter, forEach } from "lodash/fp";
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { messageChannelListenerInjectionToken, MessageChannel } from "@k8slens/messaging";

export type ElectronMessageMetadata = { frameId: number; processId: number };

export const sendMessageToListenersInMainInjectable = getInjectable({
  id: "send-message-to-listeners-in-main",

  instantiate: (di) => {
    const getMessageChannelListeners = () => di.injectMany(messageChannelListenerInjectionToken);

    return <T>(channel: MessageChannel<T>, message: T, electronMessageMetadata?: ElectronMessageMetadata) => {
      pipeline(
        getMessageChannelListeners(),
        filter((listener) => listener.channel.id === channel.id),
        forEach(({ handler }) => {
          handler(message, electronMessageMetadata);
        }),
      );
    };
  },
});
