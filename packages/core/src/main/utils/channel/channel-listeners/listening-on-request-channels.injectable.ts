/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { disposer } from "../../../../common/utils";
import type { RequestChannel } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import { getStartableStoppable } from "../../../../common/utils/get-startable-stoppable";
import enlistRawRequestChannelListenerInjectable from "./enlist-raw-request-channel-listener.injectable";
import enlistRequestChannelListenerInjectable from "./enlist-request-channel-listener.injectable";
import { rawRequestChannelListenerInjectionToken, requestChannelListenerInjectionToken } from "./listener-tokens";

const listeningOnRequestChannelsInjectable = getInjectable({
  id: "listening-on-request-channels",
  instantiate: (di) => {
    const enlistRequestChannelListener = di.inject(enlistRequestChannelListenerInjectable);
    const enlistRawRequestChannelListener = di.inject(enlistRawRequestChannelListenerInjectable);
    const requestChannelListeners = di.injectMany(requestChannelListenerInjectionToken);
    const rawRequestChannelListeners = di.injectMany(rawRequestChannelListenerInjectionToken);

    return getStartableStoppable("listening-on-request-channels", () => {
      const seenChannels = new Set<RequestChannel<unknown, unknown>>();

      for (const listener of [...requestChannelListeners, ...rawRequestChannelListeners]) {
        if (seenChannels.has(listener.channel)) {
          throw new Error(`Tried to register a multiple channel handlers for "${listener.channel.id}", only one handler is supported for a request channel.`);
        }

        seenChannels.add(listener.channel);
      }

      return disposer(
        requestChannelListeners.map(enlistRequestChannelListener),
        rawRequestChannelListeners.map(enlistRawRequestChannelListener),
      );
    });
  },
});

export default listeningOnRequestChannelsInjectable;
