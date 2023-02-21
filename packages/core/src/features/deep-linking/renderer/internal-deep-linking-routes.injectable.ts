/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { computed } from "mobx";
import { pathToRegexp } from "path-to-regexp";
import { internalDeepLinkingRouteInjectionToken } from "../common/internal-handler-token";

const internalDeepLinkingRoutesInjectable = getInjectable({
  id: "internal-deep-linking-routes",
  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const registrations = computedInjectMany(internalDeepLinkingRouteInjectionToken);

    return computed(() => new Map((
      registrations
        .get()
        .map(registration => {
          pathToRegexp(registration.path); // verify now that the schema is valid

          return [registration.path, registration.handler];
        })
    )));
  },
});

export default internalDeepLinkingRoutesInjectable;
