/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../router/router.injectable";
import { apiPrefix } from "../../../common/vars";
import { ResourceApplier } from "../../resource-applier";
import { clusterRoute } from "../../router/route";

const applyResourceRouteInjectable = getRouteInjectable({
  id: "apply-resource-route",

  instantiate: () => clusterRoute({
    method: "post",
    path: `${apiPrefix}/stack`,
  })(async ({ cluster, payload }) => ({
    response: await new ResourceApplier(cluster).apply(payload),
  })),
});

export default applyResourceRouteInjectable;
