/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getFrontEndRouteInjectable } from "../../../../front-end-route-injection-token";

const portForwardsRouteInjectable = getFrontEndRouteInjectable({
  id: "port-forwards-route",
  path: "/port-forwards/:forwardPort?",
  clusterFrame: true,
});

export default portForwardsRouteInjectable;
