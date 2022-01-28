/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import logger, { LensLogger } from "./logger";

const loggerInjectable = getInjectable({
  instantiate: () => logger as LensLogger,
  lifecycle: lifecycleEnum.singleton,
});

export default loggerInjectable;
