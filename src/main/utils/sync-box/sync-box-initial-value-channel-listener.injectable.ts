/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import syncBoxInitialValueChannelInjectable from "../../../common/utils/sync-box/sync-box-initial-value-channel.injectable";
import { syncBoxInjectionToken } from "../../../common/utils/sync-box/sync-box-injection-token";
import { getRequestChannelHandlerInjectable } from "../../../common/utils/channel/request-channel-listener-injection-token";

const syncBoxInitialValueChannelListenerInjectable = getRequestChannelHandlerInjectable(
  syncBoxInitialValueChannelInjectable,
  (di) => {
    const syncBoxes = di.injectMany(syncBoxInjectionToken);

    return () => syncBoxes.map((box) => ({
      id: box.id,
      value: box.value.get(),
    }));
  },
);

export default syncBoxInitialValueChannelListenerInjectable;
