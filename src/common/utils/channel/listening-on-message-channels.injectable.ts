/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getStartableStoppable } from "../get-startable-stoppable";
import { disposer } from "../index";
import { messageChannelListenerInjectionToken } from "./message-channel-listener-injection-token";
import { enlistMessageChannelListenerInjectionToken } from "./enlist-message-channel-listener-injection-token";

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
