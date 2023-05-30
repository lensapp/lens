/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getRequestChannelListenerInjectable } from "@k8slens/messaging";
import { enabledExtensionsPersistentStorageVersionChannel, enabledExtensionsPersistentStorageVersionInitializable } from "../common/storage-version";

const enabledExtensionsPersistentStorageVersionChannelHandler = getRequestChannelListenerInjectable({
  id: "enabled-extensions-persistent-storage-version-handler",
  channel: enabledExtensionsPersistentStorageVersionChannel,
  getHandler: (di) => {
    const version = di.inject(enabledExtensionsPersistentStorageVersionInitializable.stateToken);

    return () => version;
  },
});

export default enabledExtensionsPersistentStorageVersionChannelHandler;
