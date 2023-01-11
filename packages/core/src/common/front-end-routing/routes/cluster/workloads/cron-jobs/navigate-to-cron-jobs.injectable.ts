/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import cronJobsRouteInjectable from "./cron-jobs-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToCronJobsInjectable = getInjectable({
  id: "navigate-to-cron-jobs",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(cronJobsRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToCronJobsInjectable;
