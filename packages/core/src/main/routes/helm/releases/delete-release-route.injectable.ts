/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import { getRouteInjectable } from "../../../router/router.injectable";
import { clusterRoute } from "../../../router/route";
import deleteHelmReleaseInjectable from "../../../helm/helm-service/delete-helm-release.injectable";

const deleteReleaseRouteInjectable = getRouteInjectable({
  id: "delete-release-route",

  instantiate: (di) => {
    const deleteHelmRelease = di.inject(deleteHelmReleaseInjectable);

    return clusterRoute({
      method: "delete",
      path: `${apiPrefix}/v2/releases/{namespace}/{release}`,
    })(async ({ cluster, params: { release, namespace }}) => ({
      response: await deleteHelmRelease(cluster, release, namespace),
    }));
  },
});

export default deleteReleaseRouteInjectable;
