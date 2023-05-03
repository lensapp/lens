/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";
import { ClusterOverview } from "./cluster-overview";
import clusterOverviewRouteInjectable from "../../../common/front-end-routing/routes/cluster/overview/cluster-overview-route.injectable";

const clusterOverviewRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "cluster-overview-route-component",
  Component: ClusterOverview,
  routeInjectable: clusterOverviewRouteInjectable,
});

export default clusterOverviewRouteComponentInjectable;
