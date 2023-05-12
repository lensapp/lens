/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import jobsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/jobs/jobs-route.injectable";
import workloadsSidebarItemInjectable from "../workloads/workloads-sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToJobsInjectable from "../../../common/front-end-routing/routes/cluster/workloads/jobs/navigate-to-jobs.injectable";

const jobsSidebarItemInjectable = getInjectable({
  id: "sidebar-item-jobs",

  instantiate: (di) => {
    const route = di.inject(jobsRouteInjectable);

    return {
      parentId: workloadsSidebarItemInjectable.id,
      title: "Jobs",
      onClick: di.inject(navigateToJobsInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 70,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default jobsSidebarItemInjectable;
