/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import { getRouteInjectable } from "../../../router/router.injectable";
import { payloadWithSchemaClusterRoute } from "../../../router/route";
import installClusterHelmChartInjectable from "../../../helm/helm-service/install-helm-chart.injectable";
import { z } from "zod";

const installChartArgsSchema = z.object({
  chart: z.string(),
  values: z.record(z.any()),
  name: z.string(),
  namespace: z.string(),
  version: z.string(),
});

const installChartRouteInjectable = getRouteInjectable({
  id: "install-chart-route",

  instantiate: (di) => {
    const installHelmChart = di.inject(installClusterHelmChartInjectable);

    return payloadWithSchemaClusterRoute({
      method: "post",
      path: `${apiPrefix}/v2/releases`,
      payloadSchema: installChartArgsSchema,
    })(async ({ payload, cluster }) => ({
      response: await installHelmChart(cluster, payload),
      statusCode: 201,
    }));
  },
});

export default installChartRouteInjectable;
