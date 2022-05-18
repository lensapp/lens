/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import environmentVariablesInjectable from "../utils/environment-variables.injectable";

const isProductionInjectable = getInjectable({
  id: "is-production",

  instantiate: (di) => {
    const { NODE_ENV: nodeEnv } = di.inject(environmentVariablesInjectable);

    return nodeEnv === "production";
  },
});

export default isProductionInjectable;
