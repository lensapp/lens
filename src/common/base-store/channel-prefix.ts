/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { IpcChannelPrefixes } from "./base-store";

export const baseStoreIpcChannelPrefixesInjectionToken = getInjectionToken<IpcChannelPrefixes>({
  id: "base-store-ipc-channel-prefix-token",
});
