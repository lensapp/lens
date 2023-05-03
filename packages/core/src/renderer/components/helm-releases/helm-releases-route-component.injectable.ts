/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { HelmReleases } from "./releases";
import helmReleasesRouteInjectable from "../../../common/front-end-routing/routes/cluster/helm/releases/helm-releases-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const helmReleasesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "helm-releases-route-component",
  Component: HelmReleases,
  routeInjectable: helmReleasesRouteInjectable,
});

export default helmReleasesRouteComponentInjectable;
