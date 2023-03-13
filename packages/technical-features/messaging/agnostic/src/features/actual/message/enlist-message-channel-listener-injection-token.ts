import { getInjectionToken } from "@ogre-tools/injectable";

import type {
  MessageChannel,
  MessageChannelListener,
} from "./message-channel-listener-injection-token";

export type EnlistMessageChannelListener = (
  listener: MessageChannelListener<MessageChannel<unknown>>
) => () => void;

export const enlistMessageChannelListenerInjectionToken =
  getInjectionToken<EnlistMessageChannelListener>({
    id: "listening-to-a-message-channel",
  });
