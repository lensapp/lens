/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../router/router.injectable";
import { apiPrefix } from "../../../common/vars";
import { payloadValidatedClusterRoute } from "../../router/route";
import Joi from "joi";
import resourceApplierInjectable from "../../resource-applier/create-resource-applier.injectable";

const createResourceRouteInjectable = getRouteInjectable({
  id: "create-resource-route",

  instantiate: (di) => payloadValidatedClusterRoute({
    method: "post",
    path: `${apiPrefix}/stack`,
    payloadValidator: Joi.string(),
  })(async ({ cluster, payload }) => {
    const resourceApplier = di.inject(resourceApplierInjectable, cluster);

    return ({
      response: await resourceApplier.create(payload),
    });
  }),
});

export default createResourceRouteInjectable;
