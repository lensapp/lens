/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { HelmReleases } from "./releases";
import helmReleasesRouteInjectable from "../../../common/front-end-routing/routes/cluster/helm/releases/helm-releases-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const helmReleasesRouteComponentInjectable = getInjectable({
  id: "helm-releases-route-component",

  instantiate: (di) => ({
    route: di.inject(helmReleasesRouteInjectable),
    Component: HelmReleases,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default helmReleasesRouteComponentInjectable;
