/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import logger from "../logger";

const baseLoggerInjectable = getInjectable({
  instantiate: () => logger,
  lifecycle: lifecycleEnum.singleton,
});

export default baseLoggerInjectable;
