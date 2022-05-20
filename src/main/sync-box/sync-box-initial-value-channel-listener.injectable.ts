/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { channelListenerInjectionToken } from "../../common/channel/channel-listener-injection-token";
import syncBoxInitialValueChannelInjectable from "../../common/sync-box/sync-box-initial-value-channel.injectable";
import { syncBoxInjectionToken } from "../../common/sync-box/sync-box-injection-token";

const syncBoxInitialValueChannelListenerInjectable = getInjectable({
  id: "sync-box-initial-value-channel-listener",

  instantiate: (di) => {
    const channel = di.inject(syncBoxInitialValueChannelInjectable);
    const syncBoxes = di.injectMany(syncBoxInjectionToken);

    return {
      channel,

      handler: () =>
        syncBoxes.map((box) => ({
          id: box.id,
          value: box.value.get(),
        })),
    };
  },

  injectionToken: channelListenerInjectionToken,
});

export default syncBoxInitialValueChannelListenerInjectable;
