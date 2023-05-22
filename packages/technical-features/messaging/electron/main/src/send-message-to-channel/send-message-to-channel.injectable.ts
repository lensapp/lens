import { getInjectable } from "@ogre-tools/injectable";
import { pipeline } from "@ogre-tools/fp";
import { SendMessageToChannel, sendMessageToChannelInjectionToken } from "@k8slens/messaging";
import getWebContentsInjectable from "./get-web-contents.injectable";
import { filter, flatMap, reject } from "lodash/fp";
import type { WebContents } from "electron";
import frameIdsInjectable from "./frameIds.injectable";
import { messageChannelListenerInjectionToken } from "@k8slens/messaging";

const isDestroyed = (webContent: WebContents) => webContent.isDestroyed();
const isCrashed = (webContent: WebContents) => webContent.isCrashed();

const forEach =
  <T>(predicate: (item: T) => void) =>
  (items: T[]) =>
    items.forEach(predicate);

const sendMessageToChannelInjectable = getInjectable({
  id: "send-message-to-channel",

  instantiate: (di) => {
    const getWebContents = di.inject(getWebContentsInjectable);
    const frameIds = di.inject(frameIdsInjectable);
    const getMessageChannelListeners = () => di.injectMany(messageChannelListenerInjectionToken);

    return ((channel, message, ...asd) => {
      const messageChannelListeners = getMessageChannelListeners();

      const sendToListenersInMain = () => {
        pipeline(
          messageChannelListeners,
          filter((listener) => listener.channel.id === channel.id),
          forEach(({ channel, handler }) => {
            handler(message, ...asd);
          }),
        );
      };

      const sendToListenersInRenderers = () => {
        pipeline(
          getWebContents(),
          reject(isDestroyed),
          reject(isCrashed),

          flatMap((webContent) => [
            (channelId: string, ...args: any[]) => webContent.send(channelId, ...args),

            ...[...frameIds].map(({ frameId, processId }) => (channelId: string, ...args: any[]) => {
              webContent.sendToFrame([frameId, processId], channelId, ...args);
            }),
          ]),

          forEach((send) => {
            send(channel.id, message);
          }),
        );
      };

      sendToListenersInMain();
      sendToListenersInRenderers();
    }) as SendMessageToChannel;
  },

  injectionToken: sendMessageToChannelInjectionToken,
});

export default sendMessageToChannelInjectable;
