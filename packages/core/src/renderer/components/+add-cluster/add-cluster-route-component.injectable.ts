/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { AddCluster } from "./add-cluster";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";
import addClusterRouteInjectable from "../../../common/front-end-routing/routes/add-cluster/add-cluster-route.injectable";

const addClusterRouteComponentInjectable = getInjectable({
  id: "add-cluster-route-component",

  instantiate: (di) => ({
    route: di.inject(addClusterRouteInjectable),
    Component: AddCluster,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default addClusterRouteComponentInjectable;
