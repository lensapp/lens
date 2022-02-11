/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { apiPrefix } from "../../../common/vars";
import type { LensApiRequest } from "../../router";
import { respondJson } from "../../utils/http-responses";
import { routeInjectionToken } from "../../router/router.injectable";
import { PrometheusProviderRegistry } from "../../prometheus";
import type { MetricProviderInfo } from "../../../common/k8s-api/endpoints/metrics.api";

const getMetricProvidersRouteInjectable = getInjectable({
  id: "get-metric-providers-route",

  instantiate: () => ({
    method: "get",
    path: `${apiPrefix}/metrics/providers`,

    handler: async (request: LensApiRequest) => {
      const providers: MetricProviderInfo[] = [];

      for (const { name, id, isConfigurable } of PrometheusProviderRegistry.getInstance().providers.values()) {
        providers.push({ name, id, isConfigurable });
      }

      respondJson(request.response, providers);
    },
  }),

  injectionToken: routeInjectionToken,
});

export default getMetricProvidersRouteInjectable;
