/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import prefixedLoggerInjectable from "../logger/prefixed-logger.injectable";

const protocolHandlerLoggerInjectable = getInjectable({
  id: "protocol-handler-logger",
  instantiate: (di) => di.inject(prefixedLoggerInjectable, "PROTOCOL-HANDLER"),
});

export default protocolHandlerLoggerInjectable;
