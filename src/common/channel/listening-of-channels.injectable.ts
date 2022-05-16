/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getStartableStoppable } from "../utils/get-startable-stoppable";
import { channelListenerInjectionToken } from "./channel-listener-injection-token";
import { enlistChannelListenerInjectionToken } from "./enlist-channel-listener-injection-token";

const listeningOfChannelsInjectable = getInjectable({
  id: "listening-of-channels",

  instantiate: (di) => {
    const enlistChannelListener = di.inject(enlistChannelListenerInjectionToken);
    const channelListeners = di.injectMany(channelListenerInjectionToken);

    return getStartableStoppable("listening-of-channels", () => {
      const disposers = channelListeners.map(({ channel, handler }) =>
        enlistChannelListener(channel, handler),
      );

      return () => {
        disposers.forEach((disposer) => {
          disposer();
        });
      };
    });
  },
});


export default listeningOfChannelsInjectable;
