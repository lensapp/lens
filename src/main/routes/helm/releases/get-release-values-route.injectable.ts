/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import { helmService } from "../../../helm/helm-service";
import { getRouteInjectable } from "../../../router/router.injectable";
import { getBoolean } from "../../../utils/parse-query";
import { contentTypes } from "../../../router/router-content-types";
import { clusterRoute } from "../../../router/route";

const getReleaseRouteValuesInjectable = getRouteInjectable({
  id: "get-release-values-route",

  instantiate: () => clusterRoute({
    method: "get",
    path: `${apiPrefix}/v2/releases/{namespace}/{release}/values`,
  })(async ({ cluster, params: { namespace, release }, query }) => ({
    response: await helmService.getReleaseValues(release, {
      cluster,
      namespace,
      all: getBoolean(query, "all"),
    }),

    contentType: contentTypes.txt,
  })),
});

export default getReleaseRouteValuesInjectable;
