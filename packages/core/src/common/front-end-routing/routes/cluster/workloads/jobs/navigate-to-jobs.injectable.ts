/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import jobsRouteInjectable from "./jobs-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToJobsInjectable = getInjectable({
  id: "navigate-to-jobs",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(jobsRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToJobsInjectable;
