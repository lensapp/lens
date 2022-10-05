/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../router/router.injectable";
import { apiPrefix } from "../../../common/vars";
import { ResourceApplier } from "../../resource-applier";
import { payloadValidatedClusterRoute } from "../../router/route";
import Joi from "joi";

const createResourceRouteInjectable = getRouteInjectable({
  id: "create-resource-route",

  instantiate: () => payloadValidatedClusterRoute({
    method: "post",
    path: `${apiPrefix}/stack`,
    payloadValidator: Joi.string(),
  })(async ({ cluster, payload }) => ({
    response: await new ResourceApplier(cluster).create(payload),
  })),
});

export default createResourceRouteInjectable;
