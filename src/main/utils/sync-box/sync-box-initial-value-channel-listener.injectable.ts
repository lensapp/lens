/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import syncBoxInitialValueChannelInjectable from "../../../common/utils/sync-box/sync-box-initial-value-channel.injectable";
import { syncBoxInjectionToken } from "../../../common/utils/sync-box/sync-box-injection-token";
import { requestChannelListenerInjectionToken } from "../../../common/utils/channel/request-channel-listener-injection-token";

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

  injectionToken: requestChannelListenerInjectionToken,
});

export default syncBoxInitialValueChannelListenerInjectable;
