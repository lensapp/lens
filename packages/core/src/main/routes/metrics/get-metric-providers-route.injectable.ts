/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiPrefix } from "../../../common/vars";
import { getRouteInjectable } from "../../router/router.injectable";
import { route } from "../../router/route";
import prometheusProvidersInjectable from "../../prometheus/providers.injectable";

const getMetricProvidersRouteInjectable = getRouteInjectable({
  id: "get-metric-providers-route",

  instantiate: (di) => {
    const prometheusProviders = di.inject(prometheusProvidersInjectable);

    return route({
      method: "get",
      path: `${apiPrefix}/metrics/providers`,
    })(() => ({
      response: (
        prometheusProviders
          .get()
          .map(({ name, kind: id, isConfigurable }) => ({ name, id, isConfigurable }))
      ),
    }));
  },
});

export default getMetricProvidersRouteInjectable;
