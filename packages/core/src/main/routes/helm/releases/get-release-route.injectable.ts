/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import { getRouteInjectable } from "../../../router/router.injectable";
import { clusterRoute } from "../../../router/route";
import getHelmReleaseInjectable from "../../../helm/helm-service/get-helm-release.injectable";

const getReleaseRouteInjectable = getRouteInjectable({
  id: "get-release-route",

  instantiate: (di) => {
    const getHelmRelease = di.inject(getHelmReleaseInjectable);

    return clusterRoute({
      method: "get",
      path: `${apiPrefix}/v2/releases/{namespace}/{release}`,
    })(async ({ cluster, params }) => ({
      response: await getHelmRelease(
        cluster,
        params.release,
        params.namespace,
      ),
    }));
  },
});

export default getReleaseRouteInjectable;
