/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import packageJsonInjectable from "../../../vars/package-json.injectable";
import { frontEndRouteInjectionToken } from "../../front-end-route-injection-token";

const defaultWelcomeRouteInjectable = getInjectable({
  id: "default-welcome-route",

  instantiate: (di) => {
    const packageJson = di.inject(packageJsonInjectable);

    return {
      path: "/welcome",
      clusterFrame: false,
      isEnabled: computed(() => packageJson.config.welcomeRoute === "/welcome"),
    };
  },

  injectionToken: frontEndRouteInjectionToken,
});

export default defaultWelcomeRouteInjectable;
