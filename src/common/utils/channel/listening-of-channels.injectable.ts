/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getStartableStoppable } from "../get-startable-stoppable";
import { disposer } from "../index";
import { messageChannelListenerInjectionToken } from "./message-channel-listener-injection-token";
import { requestChannelHandlerInjectionToken } from "./request-channel-listener-injection-token";
import { enlistMessageChannelListenerInjectionToken } from "./enlist-message-channel-listener-injection-token";
import { enlistRequestChannelListenerInjectionToken } from "./enlist-request-channel-listener-injection-token";

const listeningOfChannelsInjectable = getInjectable({
  id: "listening-of-channels",

  instantiate: (di) => {
    const enlistMessageChannelListener = di.inject(enlistMessageChannelListenerInjectionToken);
    const enlistRequestChannelHandler = di.inject(enlistRequestChannelListenerInjectionToken);
    const messageChannelListeners = di.injectMany(messageChannelListenerInjectionToken);
    const requestChannelHandlers = di.injectMany(requestChannelHandlerInjectionToken);

    return getStartableStoppable("listening-of-channels", () => {
      const messageChannelDisposers = messageChannelListeners.map(enlistMessageChannelListener);
      const requestChannelDisposers = requestChannelHandlers.map(enlistRequestChannelHandler);

      return disposer(...messageChannelDisposers, ...requestChannelDisposers);
    });
  },
});


export default listeningOfChannelsInjectable;
