/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import cronJobsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/cron-jobs/cron-jobs-route.injectable";
import { workloadsSidebarItemId } from "../+workloads/workloads-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToCronJobsInjectable from "../../../common/front-end-routing/routes/cluster/workloads/cron-jobs/navigate-to-cron-jobs.injectable";

const cronJobsSidebarItemsInjectable = getInjectable({
  id: "cron-jobs-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(cronJobsRouteInjectable);
    const navigateToCronJobs = di.inject(navigateToCronJobsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "cron-jobs",
        parentId: workloadsSidebarItemId,
        title: "CronJobs",
        onClick: navigateToCronJobs,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 80,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default cronJobsSidebarItemsInjectable;
