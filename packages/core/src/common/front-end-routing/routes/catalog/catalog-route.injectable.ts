/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { Route } from "../../front-end-route-injection-token";
import { frontEndRouteInjectionToken } from "../../front-end-route-injection-token";

export interface CatalogPathParameters {
  group?: string;
  kind?: string;
}

const catalogRouteInjectable = getInjectable({
  id: "catalog-route",

  instantiate: (): Route<CatalogPathParameters> => ({
    path: "/catalog/:group?/:kind?",
    clusterFrame: false,
    isEnabled: computed(() => true),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default catalogRouteInjectable;
