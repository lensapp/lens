/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import childLoggerInjectable from "../../../common/logger/child-logger.injectable";

const shellApiRequestLoggerInjectable = getInjectable({
  id: "shell-api-request-logger",
  instantiate: (di) => di.inject(childLoggerInjectable, {
    prefix: "SHELL-API-REQUEST",
  }),
});

export default shellApiRequestLoggerInjectable;
