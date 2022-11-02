/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../router/router.injectable";
import { apiPrefix } from "../../../common/vars";
import { payloadValidatedClusterRoute } from "../../router/route";
import Joi from "joi";
import createResourceApplierInjectable from "../../resource-applier/create-resource-applier.injectable";

const createResourceRouteInjectable = getRouteInjectable({
  id: "create-resource-route",

  instantiate: (di) => {
    const createResourceApplier = di.inject(createResourceApplierInjectable);

    return payloadValidatedClusterRoute({
      method: "post",
      path: `${apiPrefix}/stack`,
      payloadValidator: Joi.string(),
    })(async ({ cluster, payload }) => ({
      response: await createResourceApplier(cluster).create(payload),
    }));
  },
});

export default createResourceRouteInjectable;
