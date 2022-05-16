/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import type { UpdateChartArgs } from "../../../helm/helm-service";
import { helmService } from "../../../helm/helm-service";
import { getRouteInjectable } from "../../../router/router.injectable";
import { payloadValidatedClusterRoute } from "../../../router/route";
import Joi from "joi";

const updateChartArgsValidator = Joi.object<UpdateChartArgs, true, UpdateChartArgs>({
  chart: Joi
    .string()
    .required(),
  version: Joi
    .string()
    .required(),
  values: Joi
    .object()
    .unknown(true),
});

const updateReleaseRouteInjectable = getRouteInjectable({
  id: "update-release-route",

  instantiate: () => payloadValidatedClusterRoute({
    method: "put",
    path: `${apiPrefix}/v2/releases/{namespace}/{release}`,
    payloadValidator: updateChartArgsValidator,
  })(async ({ cluster, params, payload }) => ({
    response: await helmService.updateRelease(
      cluster,
      params.release,
      params.namespace,
      payload,
    ),
  })),
});

export default updateReleaseRouteInjectable;
