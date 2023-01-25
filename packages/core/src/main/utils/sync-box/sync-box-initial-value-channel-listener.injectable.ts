/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { syncBoxInitialValueChannel } from "../../../common/utils/sync-box/channels";
import { syncBoxInjectionToken } from "../../../common/utils/sync-box/sync-box-injection-token";
import { getRequestChannelListenerInjectable } from "../channel/channel-listeners/listener-tokens";

const syncBoxInitialValueChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: syncBoxInitialValueChannel,
  handler: (di) => {
    const syncBoxes = di.injectMany(syncBoxInjectionToken);

    return () => syncBoxes.map((box) => ({
      id: box.id,
      value: box.value.get(),
    }));
  },
});

export default syncBoxInitialValueChannelListenerInjectable;
