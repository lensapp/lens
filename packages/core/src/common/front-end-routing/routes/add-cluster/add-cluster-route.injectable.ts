/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getFrontEndRouteInjectable } from "../../front-end-route-injection-token";

const addClusterRouteInjectable = getFrontEndRouteInjectable({
  id: "add-cluster-route",
  path: "/add-cluster",
  clusterFrame: false,
});

export default addClusterRouteInjectable;
