/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getFrontEndRouteInjectable } from "../../front-end-route-injection-token";

const extensionsRouteInjectable = getFrontEndRouteInjectable({
  id: "extensions-route",
  path: "/extensions",
  clusterFrame: false,
});

export default extensionsRouteInjectable;
