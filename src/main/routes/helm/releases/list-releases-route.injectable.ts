/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import { helmService } from "../../../helm/helm-service";
import { getRouteInjectable } from "../../../router/router.injectable";
import { clusterRoute } from "../../../router/route";

const listReleasesRouteInjectable = getRouteInjectable({
  id: "list-releases-route",

  instantiate: () => clusterRoute({
    method: "get",
    path: `${apiPrefix}/v2/releases/{namespace?}`,
  })(async ({ cluster, params }) => ({
    response: await helmService.listReleases(cluster, params.namespace),
  })),
});

export default listReleasesRouteInjectable;
