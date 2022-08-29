/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestChannelHandler } from "../../../common/utils/channel/request-channel-listener-injection-token";
import type { SyncBoxInitialValueChannel } from "../../../common/utils/sync-box/channels";
import { syncBoxInjectionToken } from "../../../common/utils/sync-box/sync-box-injection-token";

const syncBoxInitialValueChannelHandlerInjectable = getInjectable({
  id: "sync-box-initial-value-channel-handler",
  instantiate: (di): RequestChannelHandler<SyncBoxInitialValueChannel> => {
    const syncBoxes = di.injectMany(syncBoxInjectionToken);

    return () => syncBoxes.map((box) => ({
      id: box.id,
      value: box.value.get(),
    }));
  },
});

export default syncBoxInitialValueChannelHandlerInjectable;
