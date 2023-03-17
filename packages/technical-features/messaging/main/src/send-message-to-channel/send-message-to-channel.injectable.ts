import { getInjectable } from "@ogre-tools/injectable";
import { pipeline } from "@ogre-tools/fp";
import { SendMessageToChannel, sendMessageToChannelInjectionToken } from "@k8slens/messaging";
import getWebContentsInjectable from "./get-web-contents.injectable";
import { reject } from "lodash/fp";
import type { WebContents } from "electron";

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

    return ((channel, message) => {
      pipeline(
        getWebContents(),
        reject(isDestroyed),
        reject(isCrashed),

        forEach((webContent) => {
          webContent.send(channel.id, message);
        }),
      );
    }) as SendMessageToChannel;
  },

  injectionToken: sendMessageToChannelInjectionToken,
});

export default sendMessageToChannelInjectable;
