/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { NamespacesRoute } from "./route";
import namespacesRouteInjectable from "../../../common/front-end-routing/routes/cluster/namespaces/namespaces-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const namespacesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "namespaces-route-component",
  Component: NamespacesRoute,
  routeInjectable: namespacesRouteInjectable,
});

export default namespacesRouteComponentInjectable;
