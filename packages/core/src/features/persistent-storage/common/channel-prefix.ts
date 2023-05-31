/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export interface IpcChannelPrefixes {
  readonly local: string;
  readonly remote: string;
}

export const persistentStorageIpcChannelPrefixesInjectionToken = getInjectionToken<IpcChannelPrefixes>({
  id: "persistent-storage-ipc-channel-prefix-token",
});
