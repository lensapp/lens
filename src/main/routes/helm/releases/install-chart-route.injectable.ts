/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import type { InstallChartArgs } from "../../../helm/helm-service";
import { helmService } from "../../../helm/helm-service";
import { getRouteInjectable } from "../../../router/router.injectable";
import Joi from "joi";
import { payloadValidatedClusterRoute } from "../../../router/route";

const installChartArgsValidator = Joi.object<InstallChartArgs, true, InstallChartArgs>({
  chart: Joi
    .string()
    .required(),
  values: Joi
    .object()
    .required()
    .unknown(true),
  name: Joi
    .string()
    .required(),
  namespace: Joi
    .string()
    .required(),
  version: Joi
    .string()
    .required(),
});

const installChartRouteInjectable = getRouteInjectable({
  id: "install-chart-route",

  instantiate: () => payloadValidatedClusterRoute({
    method: "post",
    path: `${apiPrefix}/v2/releases`,
    payloadValidator: installChartArgsValidator,
  })(async ({ payload, cluster }) => ({
    response: await helmService.installChart(cluster, payload),
    statusCode: 201,
  })),
});

export default installChartRouteInjectable;
