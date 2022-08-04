/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import appEventBusInjectable from "./app-event-bus.injectable";

export interface AppEvent {
  name: string;
  action: string;
  destination?: string;
  params?: Record<string, any>;
}

/**
 * @deprecated Switch to using appEventBusInjectable instead
 */
export const appEventBus = asLegacyGlobalForExtensionApi(appEventBusInjectable);
