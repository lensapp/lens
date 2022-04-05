/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import helmReleasesRouteInjectable from "../../../common/front-end-routing/routes/cluster/helm/releases/helm-releases-route.injectable";
import routePathParametersInjectable from "../../routes/route-path-parameters.injectable";

const helmReleasesRouteParametersInjectable = getInjectable({
  id: "helm-releases-route-parameters",

  instantiate: (di) => {
    const route = di.inject(helmReleasesRouteInjectable);
    const pathParameters = di.inject(routePathParametersInjectable)(route);

    return {
      namespace: computed(() => pathParameters.get().namespace),
      name: computed(() => pathParameters.get().name),
    };
  },
});

export default helmReleasesRouteParametersInjectable;
