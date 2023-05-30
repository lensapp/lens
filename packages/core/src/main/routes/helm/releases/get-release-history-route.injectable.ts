/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import { getClusterRouteInjectable } from "../../../router/router.injectable";
import { clusterRoute } from "../../../router/cluster-route";
import getClusterHelmReleaseHistoryInjectable from "../../../helm/helm-service/get-helm-release-history.injectable";

const getReleaseRouteHistoryInjectable = getClusterRouteInjectable({
  id: "get-release-history-route",

  instantiate: (di) => {
    const getHelmReleaseHistory = di.inject(getClusterHelmReleaseHistoryInjectable);

    return clusterRoute({
      method: "get",
      path: `${apiPrefix}/v2/releases/{namespace}/{name}/history`,
    })(async ({ cluster, params }) => ({
      response: await getHelmReleaseHistory(cluster, params),
    }));
  },
});

export default getReleaseRouteHistoryInjectable;
