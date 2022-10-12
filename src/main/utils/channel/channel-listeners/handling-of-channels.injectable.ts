/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { disposer, iter } from "../../../../common/utils";
import type { RequestChannel } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import { getStartableStoppable } from "../../../../common/utils/get-startable-stoppable";
import enlistRequestChannelListenerInjectable from "./enlist-request-channel-listener.injectable";
import { requestChannelListenerInjectionToken } from "./listener-tokens";

const listenerOfRequestChannelsInjectable = getInjectable({
  id: "listener-of-request-channels",
  instantiate: (di) => {
    const enlistRequestChannelListener = di.inject(enlistRequestChannelListenerInjectable);
    const requestChannelListeners = di.injectMany(requestChannelListenerInjectionToken);

    return getStartableStoppable("listening-of-request-channels", () => {
      const seenChannels = new Set<RequestChannel<unknown, unknown>>();
      const requestChannelDisposers = iter.pipeline(requestChannelListeners.values())
        .tap(listener => {
          if (seenChannels.has(listener.channel)) {
            throw new Error(`Trying to register a multiple channel handlers for "${listener.channel.id}", which is an error`);
          }

          seenChannels.add(listener.channel);
        })
        .map(enlistRequestChannelListener)
        .collect(v => Array.from(v));

      return disposer(...requestChannelDisposers);
    });
  },
});

export default listenerOfRequestChannelsInjectable;
