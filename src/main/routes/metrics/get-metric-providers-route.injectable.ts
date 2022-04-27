/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { apiPrefix } from "../../../common/vars";
import type { Route } from "../../router/router";
import { routeInjectionToken } from "../../router/router.injectable";
import type { MetricProviderInfo } from "../../../common/k8s-api/endpoints/metrics.api";
import prometheusProviderRegistryInjectable from "../../prometheus/prometheus-provider-registry.injectable";

const getMetricProvidersRouteInjectable = getInjectable({
  id: "get-metric-providers-route",

  instantiate: (di): Route<MetricProviderInfo[]> => {
    const prometheusProviderRegistry = di.inject(prometheusProviderRegistryInjectable);

    return {
      method: "get",
      path: `${apiPrefix}/metrics/providers`,

      handler: () => {
        const providers: MetricProviderInfo[] = [];

        for (const {
          name,
          id,
          isConfigurable,
        } of prometheusProviderRegistry.providers.values()) {
          providers.push({ name, id, isConfigurable });
        }

        return { response: providers };
      },
    };
  },

  injectionToken: routeInjectionToken,
});

export default getMetricProvidersRouteInjectable;
