/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export const shouldPersistentStorageDisableSyncInIpcListenerInjectionToken = getInjectionToken<boolean>({
  id: "should-persistent-storage-disable-sync-in-ipc-listener-token",
});
