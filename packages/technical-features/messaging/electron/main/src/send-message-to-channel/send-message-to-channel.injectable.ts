import { getInjectable } from "@ogre-tools/injectable";
import { SendMessageToChannel, sendMessageToChannelInjectionToken } from "@k8slens/messaging";
import getWebContentsInjectable from "./get-web-contents.injectable";
import type { WebContents } from "electron";
import frameIdsInjectable from "./frameIds.injectable";

const isDestroyed = (webContent: WebContents) => webContent.isDestroyed();
const isCrashed = (webContent: WebContents) => webContent.isCrashed();
const not =
  <T>(fn: (val: T) => boolean) =>
  (val: T) =>
    !fn(val);

const sendMessageToChannelInjectable = getInjectable({
  id: "send-message-to-channel",

  instantiate: (di) => {
    const getWebContents = di.inject(getWebContentsInjectable);
    const frameIds = di.inject(frameIdsInjectable);

    return ((channel, message) => {
      getWebContents()
        .filter(not(isDestroyed))
        .filter(not(isCrashed))
        .flatMap((webContent) => [
          (channelId: string, ...args: unknown[]) => webContent.send(channelId, ...args),

          ...[...frameIds].map(({ frameId, processId }) => (channelId: string, ...args: unknown[]) => {
            webContent.sendToFrame([processId, frameId], channelId, ...args);
          }),
        ])
        .forEach((send) => {
          send(channel.id, message);
        });
    }) as SendMessageToChannel;
  },

  injectionToken: sendMessageToChannelInjectionToken,
});

export default sendMessageToChannelInjectable;
