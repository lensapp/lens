/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getFrontEndRouteInjectable } from "../../../../front-end-route-injection-token";

const customResourcesRouteInjectable = getFrontEndRouteInjectable({
  id: "custom-resources-route",
  path: "/crd/:group?/:name?",
  clusterFrame: true,
});

export default customResourcesRouteInjectable;
