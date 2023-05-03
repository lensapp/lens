/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { NodesRoute } from "./route";
import nodesRouteInjectable from "../../../common/front-end-routing/routes/cluster/nodes/nodes-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const nodesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "nodes-route-component",
  Component: NodesRoute,
  routeInjectable: nodesRouteInjectable,
});

export default nodesRouteComponentInjectable;
