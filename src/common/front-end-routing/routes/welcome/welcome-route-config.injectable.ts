/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import packageJsonInjectable from "../../../vars/package-json.injectable";

const welcomeRouteConfigInjectable = getInjectable({
  id: "welcome-route-config",

  instantiate: (di) => {
    const packageJson = di.inject(packageJsonInjectable);

    return packageJson.config.welcomeRoute;
  },
});

export default welcomeRouteConfigInjectable;
