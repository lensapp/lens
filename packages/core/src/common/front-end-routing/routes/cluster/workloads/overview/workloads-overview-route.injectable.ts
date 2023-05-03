/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getFrontEndRouteInjectable } from "../../../../front-end-route-injection-token";

const workloadsOverviewRouteInjectable = getFrontEndRouteInjectable({
  id: "workloads-overview-route",
  path: "/workloads",
  clusterFrame: true,
});

export default workloadsOverviewRouteInjectable;
