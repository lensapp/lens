/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import createPrefixedLoggerInjectable from "../../common/logger/create-prefixed-logger.injectable";

const trayLoggerInjectable = getInjectable({
  instantiate: (di) => di.inject(createPrefixedLoggerInjectable)("[TRAY]:"),
  lifecycle: lifecycleEnum.singleton,
});

export default trayLoggerInjectable;
