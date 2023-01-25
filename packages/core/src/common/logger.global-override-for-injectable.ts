/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import loggerInjectable from "./logger.injectable";
import { getGlobalOverride } from "./test-utils/get-global-override";
import { noop } from "./utils";

export default getGlobalOverride(loggerInjectable, () => ({
  warn: noop,
  debug: noop,
  error: noop,
  info: noop,
  silly: noop,
}));
