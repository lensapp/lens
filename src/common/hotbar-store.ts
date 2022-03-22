/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import hotbarStoreInjectable from "./hotbar-store.injectable";

import {
  asLegacyGlobalSingletonForExtensionApi,
} from "../extensions/as-legacy-globals-for-extension-api/as-legacy-global-singleton-object-for-extension-api";

export const HotbarStore = asLegacyGlobalSingletonForExtensionApi(hotbarStoreInjectable);
