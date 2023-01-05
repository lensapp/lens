/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isProductionInjectable from "./is-production.injectable";
import isTestEnvInjectable from "./is-test-env.injectable";

const isDevelopmentInjectable = getInjectable({
  id: "is-development",

  instantiate: (di) => {
    const isProduction = di.inject(isProductionInjectable);
    const isTestEnv = di.inject(isTestEnvInjectable);

    return !isTestEnv && !isProduction;
  },
});

export default isDevelopmentInjectable;
