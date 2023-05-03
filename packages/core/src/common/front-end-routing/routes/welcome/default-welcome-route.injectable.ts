/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { computed } from "mobx";
import welcomeRouteConfigInjectable from "./welcome-route-config.injectable";
import { getFrontEndRouteInjectable } from "../../front-end-route-injection-token";

const defaultWelcomeRouteInjectable = getFrontEndRouteInjectable({
  id: "default-welcome-route",
  path: "/welcome",
  clusterFrame: false,
  isEnabled: (di) => {
    const welcomeRoute = di.inject(welcomeRouteConfigInjectable);

    return computed(() => welcomeRoute === "/welcome");
  },
});

export default defaultWelcomeRouteInjectable;
