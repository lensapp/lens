/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import nodeEnvInjectionToken from "../common/vars/node-env-injection-token";

const nodeEnvForTestingEnvInjectable = getInjectable({
  id: "node-env-for-testing-env",
  instantiate: () => "production",
  injectionToken: nodeEnvInjectionToken,
});

export default nodeEnvForTestingEnvInjectable;
