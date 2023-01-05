/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import { getRouteInjectable } from "../../../router/router.injectable";
import { clusterRoute } from "../../../router/route";
import listHelmReleasesInjectable from "../../../helm/helm-service/list-helm-releases.injectable";

const listReleasesRouteInjectable = getRouteInjectable({
  id: "list-releases-route",

  instantiate: (di) => {
    const listHelmReleases = di.inject(listHelmReleasesInjectable);

    return clusterRoute({
      method: "get",
      path: `${apiPrefix}/v2/releases/{namespace?}`,
    })(async ({ cluster, params }) => ({
      response: await listHelmReleases(cluster, params.namespace),
    }));
  },
});

export default listReleasesRouteInjectable;
