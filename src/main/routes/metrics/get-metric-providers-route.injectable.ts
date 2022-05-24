/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiPrefix } from "../../../common/vars";
import { getRouteInjectable } from "../../router/router.injectable";
import { route } from "../../router/route";
import prometheusProviderRegistryInjectable from "../../prometheus/prometheus-provider-registry.injectable";

const getMetricProvidersRouteInjectable = getRouteInjectable({
  id: "get-metric-providers-route",

  instantiate: (di) => {
    const prometheusProviderRegistry = di.inject(prometheusProviderRegistryInjectable);

    return route({
      method: "get",
      path: `${apiPrefix}/metrics/providers`,
    })(() => ({
      response: Array.from(
        prometheusProviderRegistry
          .providers
          .values(),
        ({ name, id, isConfigurable }) => ({ name, id, isConfigurable }),
      ),
    }));
  },
});

export default getMetricProvidersRouteInjectable;
