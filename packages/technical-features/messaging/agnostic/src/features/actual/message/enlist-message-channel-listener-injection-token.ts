import type { Disposer } from "@k8slens/utilities";
import { getInjectionToken } from "@ogre-tools/injectable";

import type { MessageChannel, MessageChannelListener } from "./message-channel-listener-injection-token";

export type EnlistMessageChannelListener = <T>(listener: MessageChannelListener<MessageChannel<T>>) => Disposer;

export const enlistMessageChannelListenerInjectionToken = getInjectionToken<EnlistMessageChannelListener>({
  id: "listening-to-a-message-channel",
});
