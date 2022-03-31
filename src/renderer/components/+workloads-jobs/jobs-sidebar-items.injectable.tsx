/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import jobsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/jobs/jobs-route.injectable";
import { workloadsSidebarItemId } from "../+workloads/workloads-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToJobsInjectable from "../../../common/front-end-routing/routes/cluster/workloads/jobs/navigate-to-jobs.injectable";

const jobsSidebarItemsInjectable = getInjectable({
  id: "jobs-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(jobsRouteInjectable);
    const navigateToJobs = di.inject(navigateToJobsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "jobs",
        parentId: workloadsSidebarItemId,
        title: "Jobs",
        onClick: navigateToJobs,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 70,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default jobsSidebarItemsInjectable;
