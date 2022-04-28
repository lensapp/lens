/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import childLoggerInjectable from "../../common/logger/child-logger.injectable";

const windowManagerLoggerInjectable = getInjectable({
  id: "window-manager-logger",
  instantiate: (di) => di.inject(childLoggerInjectable, {
    prefix: "WINDOW-MANAGER",
  }),
});

export default windowManagerLoggerInjectable;
