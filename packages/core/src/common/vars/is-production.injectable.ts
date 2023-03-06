/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { nodeEnvInjectionToken } from "./node-env-injection-token";

const isProductionInjectable = getInjectable({
  id: "is-production",

  instantiate: (di) => {
    const nodeEnv = di.inject(nodeEnvInjectionToken);

    return nodeEnv === "production";
  },
});

export default isProductionInjectable;
