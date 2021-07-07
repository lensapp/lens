/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../router/router.injectable";
import { apiPrefix } from "../../../common/vars";
import { clusterRoute } from "../../router/route";
import createK8sResourceApplierInjectable from "../../k8s/resource-applier/create.injectable";

const applyResourceRouteInjectable = getRouteInjectable({
  id: "apply-resource-route",

  instantiate: (di) => {
    const createK8sResourceApplier = di.inject(createK8sResourceApplierInjectable);

    return clusterRoute({
      method: "post",
      path: `${apiPrefix}/stack`,
    })(async ({ cluster, payload }) => ({
      response: await createK8sResourceApplier(cluster).apply(payload),
    }));
  },
});

export default applyResourceRouteInjectable;
