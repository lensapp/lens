/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { isProduction, isTestEnv } from "../vars";

const isDevelopmentInjectable = getInjectable({
  id: "is-development",
  instantiate: () => !isTestEnv && !isProduction,
  causesSideEffects: true,
});

export default isDevelopmentInjectable;
