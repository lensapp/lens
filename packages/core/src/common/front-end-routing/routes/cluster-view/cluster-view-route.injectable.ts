/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getFrontEndRouteInjectable } from "../../front-end-route-injection-token";

const clusterViewRouteInjectable = getFrontEndRouteInjectable({
  id: "cluster-view-route",
  path: "/cluster/:clusterId",
  clusterFrame: false,
});

export default clusterViewRouteInjectable;
