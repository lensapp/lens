/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getFrontEndRouteInjectable } from "../../../../front-end-route-injection-token";

export interface HelmReleasesPathParameters {
  namespace?: string;
  name?: string;
}

const helmReleasesRouteInjectable = getFrontEndRouteInjectable({
  id: "helm-releases-route",
  path: "/helm/releases/:namespace?/:name?",
  clusterFrame: true,
});

export default helmReleasesRouteInjectable;
