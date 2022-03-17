/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiPrefix } from "../../../common/vars";
import { getRouteInjectable } from "../../router/router.injectable";
import { PrometheusProviderRegistry } from "../../prometheus";
import { route } from "../../router/route";

const getMetricProvidersRouteInjectable = getRouteInjectable({
  id: "get-metric-providers-route",

  instantiate: () => route({
    method: "get",
    path: `${apiPrefix}/metrics/providers`,
  })(() => ({
    response: Array.from(
      PrometheusProviderRegistry
        .getInstance()
        .providers
        .values(),
      ({ name, id, isConfigurable }) => ({ name, id, isConfigurable }),
    ),
  })),
});

export default getMetricProvidersRouteInjectable;
