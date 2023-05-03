/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Deployments } from "./deployments";
import deploymentsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/deployments/deployments-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const deploymentsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "deployments-route-component",
  Component: Deployments,
  routeInjectable: deploymentsRouteInjectable,
});

export default deploymentsRouteComponentInjectable;
