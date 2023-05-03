/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Jobs } from "./jobs";
import jobsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/jobs/jobs-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const jobsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "jobs-route-component",
  Component: Jobs,
  routeInjectable: jobsRouteInjectable,
});

export default jobsRouteComponentInjectable;
