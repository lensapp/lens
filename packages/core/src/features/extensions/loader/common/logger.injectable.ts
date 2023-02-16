/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import prefixedLoggerInjectable from "../../../../common/logger/prefixed-logger.injectable";

const extensionLoadingLoggerInjectable = getInjectable({
  id: "extension-loading-logger",
  instantiate: (di) => di.inject(prefixedLoggerInjectable, "EXTENSION-LOADER"),
});

export default extensionLoadingLoggerInjectable;
