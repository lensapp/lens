/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";

export const nodeEnvInjectionToken = getInjectionToken<string | undefined>({
  id: "node-env-injection-token",
});

export default nodeEnvInjectionToken;
