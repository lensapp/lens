/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { isTestEnv } from "../vars";
import isProductionInjectable from "./is-production.injectable";

const isDevelopmentInjectable = getInjectable({
  id: "is-development",

  instantiate: (di) => {
    const isProduction = di.inject(isProductionInjectable);

    return !isTestEnv && !isProduction;
  },

  causesSideEffects: true,
});

export default isDevelopmentInjectable;
