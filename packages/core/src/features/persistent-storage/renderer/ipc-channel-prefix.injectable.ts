/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { persistentStorageIpcChannelPrefixesInjectionToken } from "../common/channel-prefix";

const baseStoreIpcChannelPrefixInjectable = getInjectable({
  id: "base-store-ipc-channel-prefix",
  instantiate: () => ({
    local: "store-sync-renderer",
    remote: "store-sync-main",
  }),
  injectionToken: persistentStorageIpcChannelPrefixesInjectionToken,
});

export default baseStoreIpcChannelPrefixInjectable;
