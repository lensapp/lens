/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { KubeResource } from "../../../common/rbac";
import isAllowedResourceInjectable from "../../../common/utils/is-allowed-resource.injectable";
import clusterOverviewRouteInjectable from "../../../common/front-end-routing/routes/cluster/overview/cluster-overview-route.injectable";
import workloadsOverviewRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/overview/workloads-overview-route.injectable";
import { buildURL } from "../../../common/utils/buildUrl";

const startUrlInjectable = getInjectable({
  id: "start-url",

  instantiate: (di) => {
    const isAllowedResource = (resourceName: string) => di.inject(isAllowedResourceInjectable, resourceName);

    const clusterOverviewRoute = di.inject(clusterOverviewRouteInjectable);
    const workloadOverviewRoute = di.inject(workloadsOverviewRouteInjectable);
    const clusterOverviewUrl = buildURL(clusterOverviewRoute.path);
    const workloadOverviewUrl = buildURL(workloadOverviewRoute.path);

    return computed(() => {
      const resources: KubeResource[] = ["events", "nodes", "pods"];

      return resources.every((resourceName) => isAllowedResource(resourceName))
        ? clusterOverviewUrl
        : workloadOverviewUrl;
    });
  },
});

export default startUrlInjectable;
