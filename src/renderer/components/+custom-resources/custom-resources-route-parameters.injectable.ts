/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import routePathParametersInjectable from "../../routes/route-path-parameters.injectable";
import customResourcesRouteInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/custom-resources/custom-resources-route.injectable";

const customResourcesRouteParametersInjectable = getInjectable({
  id: "custom-resources-route-parameters",

  instantiate: (di) => {
    const route = di.inject(customResourcesRouteInjectable);
    const pathParameters = di.inject(routePathParametersInjectable)(route);

    return {
      group: computed(() => pathParameters.get().group),
      name: computed(() => pathParameters.get().name),
    };
  },
});

export default customResourcesRouteParametersInjectable;
