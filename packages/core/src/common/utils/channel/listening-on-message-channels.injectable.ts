/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getStartableStoppable } from "../get-startable-stoppable";
import { messageChannelListenerInjectionToken } from "./message-channel-listener-injection-token";
import { enlistMessageChannelListenerInjectionToken } from "./enlist-message-channel-listener-injection-token";
import { disposer } from "@k8slens/utilities";

const listeningOnMessageChannelsInjectable = getInjectable({
  id: "listening-on-message-channels",

  instantiate: (di) => {
    const enlistMessageChannelListener = di.inject(enlistMessageChannelListenerInjectionToken);
    const messageChannelListeners = di.injectMany(messageChannelListenerInjectionToken);

    return getStartableStoppable("listening-on-channels", () => (
      disposer(messageChannelListeners.map(enlistMessageChannelListener))
    ));
  },
});


export default listeningOnMessageChannelsInjectable;
