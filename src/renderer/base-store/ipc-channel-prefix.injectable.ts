/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { baseStoreIpcChannelPrefixInjectionToken } from "../../common/base-store/channel-prefix";

const baseStoreIpcChannelPrefixInjectable = getInjectable({
  id: "base-store-ipc-channel-prefix",
  instantiate: () => "store-sync-renderer",
  injectionToken: baseStoreIpcChannelPrefixInjectionToken,
});

export default baseStoreIpcChannelPrefixInjectable;
