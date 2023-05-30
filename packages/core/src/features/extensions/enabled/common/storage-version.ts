/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getRequestChannel } from "@k8slens/messaging";
import { getInitializable } from "../../../../common/initializable-state/create";

export const enabledExtensionsPersistentStorageVersionInitializable = getInitializable<string>(
  "enabled-extensions-persistent-storage-version",
);

export const enabledExtensionsPersistentStorageVersionChannel = getRequestChannel<void, string>(
  "enabled-extensions-persistent-storage-version",
);
