/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import childLoggerInjectable from "../logger/child-logger.injectable";

const lensProtocolRouterLoggerInjectable = getInjectable({
  id: "lens-protocol-handler-logger",
  instantiate: (di) => di.inject(childLoggerInjectable, {
    prefix: "LENS-PROTOCOL-ROUTER",
  }),
});

export default lensProtocolRouterLoggerInjectable;
