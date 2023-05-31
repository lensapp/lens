/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { PersistentStorageParams } from "../../features/persistent-storage/common/create.injectable";
import type { ExtensionStoreParams } from "../base-extension-store";
import { BaseExtensionStore as ExtensionStore } from "../base-extension-store";

export type {
  ExtensionStoreParams,
  PersistentStorageParams,
};

export { ExtensionStore };
