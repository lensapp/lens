/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { NodesRoute } from "./route";
import nodesRouteInjectable from "../../../common/front-end-routing/routes/cluster/nodes/nodes-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const nodesRouteComponentInjectable = getInjectable({
  id: "nodes-route-component",

  instantiate: (di) => ({
    route: di.inject(nodesRouteInjectable),
    Component: NodesRoute,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default nodesRouteComponentInjectable;
