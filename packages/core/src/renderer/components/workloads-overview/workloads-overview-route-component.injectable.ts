/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { WorkloadsOverview } from "./overview";
import workloadsOverviewRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/overview/workloads-overview-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const workloadsOverviewRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "workloads-overview-route-component",
  Component: WorkloadsOverview,
  routeInjectable: workloadsOverviewRouteInjectable,
});

export default workloadsOverviewRouteComponentInjectable;
