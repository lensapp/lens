/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import routePathParametersInjectable from "../../routes/route-path-parameters.injectable";
import catalogRouteInjectable from "../../../common/front-end-routing/routes/catalog/catalog-route.injectable";

const catalogRouteParametersInjectable = getInjectable({
  id: "catalog-route-parameters",

  instantiate: (di) => {
    const route = di.inject(catalogRouteInjectable);
    const pathParameters = di.inject(routePathParametersInjectable)(route);

    return {
      group: computed(() => pathParameters.get().group),
      kind: computed(() => pathParameters.get().kind),
    };
  },
});

export default catalogRouteParametersInjectable;
