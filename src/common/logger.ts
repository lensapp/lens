/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import loggerInjectable from "./logger.injectable";

export interface Logger {
  info: (message: string, ...args: any) => void;
  error: (message: string, ...args: any) => void;
  debug: (message: string, ...args: any) => void;
  warn: (message: string, ...args: any) => void;
  silly: (message: string, ...args: any) => void;
}

/**
 * @deprecated use `di.inject(loggerInjectable)` instead
 */
export default asLegacyGlobalForExtensionApi(loggerInjectable);
