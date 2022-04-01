/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { Route, routeInjectionToken } from "../../../../route-injection-token";

export interface HelmReleasesPathParameters {
  namespace?: string;
  name?: string;
}

const helmReleasesRouteInjectable = getInjectable({
  id: "helm-releases-route",

  instantiate: (): Route<HelmReleasesPathParameters> => ({
    path: "/helm/releases/:namespace?/:name?",
    clusterFrame: true,
    isEnabled: computed(() => true),
  }),

  injectionToken: routeInjectionToken,
});

export default helmReleasesRouteInjectable;
