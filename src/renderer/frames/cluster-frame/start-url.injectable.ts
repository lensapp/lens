/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import clusterOverviewRouteInjectable from "../../../common/front-end-routing/routes/cluster/overview/cluster-overview-route.injectable";
import workloadsOverviewRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/overview/workloads-overview-route.injectable";
import { buildURL } from "../../../common/utils/buildUrl";

const startUrlInjectable = getInjectable({
  id: "start-url",

  instantiate: (di) => {
    const clusterOverviewRoute = di.inject(clusterOverviewRouteInjectable);
    const workloadOverviewRoute = di.inject(workloadsOverviewRouteInjectable);
    const clusterOverviewUrl = buildURL(clusterOverviewRoute.path);
    const workloadOverviewUrl = buildURL(workloadOverviewRoute.path);

    return computed(() => {
      return clusterOverviewRoute.isEnabled.get()
        ? clusterOverviewUrl
        : workloadOverviewUrl;
    });
  },
});

export default startUrlInjectable;
