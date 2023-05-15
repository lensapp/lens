/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import cronJobsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/cron-jobs/cron-jobs-route.injectable";
import workloadsSidebarItemInjectable from "../workloads/workloads-sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToCronJobsInjectable from "../../../common/front-end-routing/routes/cluster/workloads/cron-jobs/navigate-to-cron-jobs.injectable";

const cronJobsSidebarItemInjectable = getInjectable({
  id: "sidebar-item-cron-jobs",

  instantiate: (di) => {
    const route = di.inject(cronJobsRouteInjectable);

    return {
      parentId: workloadsSidebarItemInjectable.id,
      title: "Cron Jobs",
      onClick: di.inject(navigateToCronJobsInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 80,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default cronJobsSidebarItemInjectable;
