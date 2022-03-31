/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import secretsRouteInjectable from "./secrets-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToSecretsInjectable = getInjectable({
  id: "navigate-to-secrets",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(secretsRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToSecretsInjectable;
