/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { requestSystemCAsInjectionToken } from "./request-system-cas-token";

const requestSystemCAsInjectable = getInjectable({
  id: "request-system-cas",
  instantiate: () => async () => [],
  injectionToken: requestSystemCAsInjectionToken,
});

export default requestSystemCAsInjectable;
