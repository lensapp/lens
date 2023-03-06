/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { nodeEnvInjectionToken } from "./node-env-injection-token";

const nodeEnvFakeInjectable = getInjectable({
  id: "node-env-fake",
  instantiate: () => "production",
  injectionToken: nodeEnvInjectionToken,
});

export default nodeEnvFakeInjectable;
