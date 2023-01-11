/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterView } from "./cluster-view";
import clusterViewRouteInjectable from "../../../common/front-end-routing/routes/cluster-view/cluster-view-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const clusterViewRouteComponentInjectable = getInjectable({
  id: "cluster-view-route-component",

  instantiate: (di) => ({
    route: di.inject(clusterViewRouteInjectable),
    Component: ClusterView,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default clusterViewRouteComponentInjectable;
