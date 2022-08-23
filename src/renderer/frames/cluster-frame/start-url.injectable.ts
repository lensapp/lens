/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import clusterOverviewRouteInjectable from "../../../common/front-end-routing/routes/cluster/overview/cluster-overview-route.injectable";
import workloadsOverviewRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/overview/workloads-overview-route.injectable";

const startUrlInjectable = getInjectable({
  id: "start-url",

  instantiate: (di) => {
    const clusterOverviewRoute = di.inject(clusterOverviewRouteInjectable);
    const workloadOverviewRoute = di.inject(workloadsOverviewRouteInjectable);

    return computed(() => {
      if (clusterOverviewRoute.isEnabled.get()) {
        return clusterOverviewRoute.path;
      }

      if (workloadOverviewRoute.isEnabled.get()) {
        return workloadOverviewRoute.path;
      }

      /**
       * NOTE: This will never be executed as `workloadOverviewRoute.isEnabled` always is true. It
       * is here is guard against accidental changes at a distance within `workloadOverviewRoute`.
       */
      throw new Error("Exhausted all possible starting locations and none are active. This is a bug.");
    });
  },
});

export default startUrlInjectable;
