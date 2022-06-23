/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "./logger.injectable";

const logErrorInjectable = getInjectable({
  id: "log-error",
  instantiate: (di) => di.inject(loggerInjectable).error,
});

export default logErrorInjectable;
