/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { baseLoggerInjectionToken } from "../../common/logger/logger.token";

const loggerInjectable = getInjectable({
  id: "logger",
  instantiate: () => console,
  injectionToken: baseLoggerInjectionToken,
});

export default loggerInjectable;
