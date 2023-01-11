/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import welcomeRouteConfigInjectable from "./welcome-route-config.injectable";
import { frontEndRouteInjectionToken } from "../../front-end-route-injection-token";

const welcomeRouteInjectable = getInjectable({
  id: "welcome-route",

  instantiate: (di) => {
    const welcomeRoute = di.inject(welcomeRouteConfigInjectable);

    return {
      path: welcomeRoute,
      clusterFrame: false,
      isEnabled: computed(() => true),
    };
  },

  injectionToken: frontEndRouteInjectionToken,
});

export default welcomeRouteInjectable;
