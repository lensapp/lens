/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type { LogFunction, Logger } from "./src/logger.injectable";
export {
  logDebugInjectionToken,
  logErrorInjectionToken,
  logInfoInjectionToken,
  logSillyInjectionToken,
  logWarningInjectionToken,
} from "./src/logger.injectable";

/** @deprecated Use specific injectionToken, eg. logErrorInjectionToken */
export { loggerInjectionToken } from "./src/logger.injectable";
/** @deprecated Use specific injectionToken, eg. logErrorInjectionToken */
export { prefixedLoggerInjectable } from "./src/prefixed-logger.injectable";
export { loggerTransportInjectionToken } from "./src/transports";
export { winstonLoggerInjectable } from "./src/winston-logger.injectable";
export { loggerFeature } from "./src/feature";
