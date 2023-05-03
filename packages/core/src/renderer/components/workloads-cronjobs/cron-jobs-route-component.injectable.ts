/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { CronJobs } from "./cronjobs";
import cronJobsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/cron-jobs/cron-jobs-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const cronJobsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "cron-jobs-route-component",
  Component: CronJobs,
  routeInjectable: cronJobsRouteInjectable,
});

export default cronJobsRouteComponentInjectable;
