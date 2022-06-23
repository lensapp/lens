/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalForExtensionApi } from "../../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import notificationsStoreInjectable from "./notifications-store.injectable";

export * from "./notifications";
export * from "./notifications.store";

export const notificationsStore = asLegacyGlobalForExtensionApi(notificationsStoreInjectable);
