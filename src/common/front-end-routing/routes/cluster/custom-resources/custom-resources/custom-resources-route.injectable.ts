/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { Route, routeInjectionToken } from "../../../../route-injection-token";

export interface CustomResourcesPathParameters {
  group?: string;
  name?: string;
}

const customResourcesRouteInjectable = getInjectable({
  id: "custom-resources-route",

  instantiate: (): Route<CustomResourcesPathParameters> => ({
    path: "/crd/:group?/:name?",
    clusterFrame: true,
    isEnabled: computed(() => true),
  }),

  injectionToken: routeInjectionToken,
});

export default customResourcesRouteInjectable;
