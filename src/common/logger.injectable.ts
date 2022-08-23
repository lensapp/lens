/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Logger } from "./logger";
import logger from "./logger";

const loggerInjectable = getInjectable({
  id: "logger",
  instantiate: (): Logger => logger,
});

export default loggerInjectable;
