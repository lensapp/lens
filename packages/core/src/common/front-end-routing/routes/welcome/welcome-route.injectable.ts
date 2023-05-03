/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import welcomeRouteConfigInjectable from "./welcome-route-config.injectable";
import { getFrontEndRouteInjectable } from "../../front-end-route-injection-token";

const welcomeRouteInjectable = getFrontEndRouteInjectable({
  id: "welcome-route",
  path: (di) => di.inject(welcomeRouteConfigInjectable),
  clusterFrame: false,
});

export default welcomeRouteInjectable;
