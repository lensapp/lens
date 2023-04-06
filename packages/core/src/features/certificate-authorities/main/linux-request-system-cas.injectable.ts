/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { platformSpecificRequestSystemCAsInjectionToken } from "../common/request-system-cas-token";

const linuxRequestSystemCAsInjectable = getInjectable({
  id: "linux-request-system-cas",
  instantiate: () => ({
    platform: "linux" as const,
    instantiate: () => async () => [],
  }),
  injectionToken: platformSpecificRequestSystemCAsInjectionToken,
});

export default linuxRequestSystemCAsInjectable;
