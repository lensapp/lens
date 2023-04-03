/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldPersistentStorageDisableSyncInIpcListenerInjectionToken } from "../../common/persistent-storage/disable-sync";

const shouldBaseStoreDisableSyncInIpcListenerInjectable = getInjectable({
  id: "should-base-store-disable-sync-in-ipc-listener",
  instantiate: () => false,
  injectionToken: shouldPersistentStorageDisableSyncInIpcListenerInjectionToken,
});

export default shouldBaseStoreDisableSyncInIpcListenerInjectable;
