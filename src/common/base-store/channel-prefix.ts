/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export const baseStoreIpcChannelPrefixInjectionToken = getInjectionToken<string>({
  id: "base-store-ipc-channel-prefix-token",
});
