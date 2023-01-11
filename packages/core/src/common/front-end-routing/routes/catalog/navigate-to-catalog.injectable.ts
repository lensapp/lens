/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CatalogPathParameters } from "./catalog-route.injectable";
import catalogRouteInjectable from "./catalog-route.injectable";
import { navigateToRouteInjectionToken } from "../../navigate-to-route-injection-token";

export type NavigateToCatalog = (parameters?: CatalogPathParameters) => void;

const navigateToCatalogInjectable = getInjectable({
  id: "navigate-to-catalog",

  instantiate: (di): NavigateToCatalog => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const catalogRoute = di.inject(catalogRouteInjectable);

    return (parameters) =>
      navigateToRoute(catalogRoute, {
        parameters,
      });
  },
});

export default navigateToCatalogInjectable;
