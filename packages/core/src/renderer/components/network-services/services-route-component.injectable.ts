/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Services } from "./services";
import servicesRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/services/services-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const servicesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "services-route-component",
  Component: Services,
  routeInjectable: servicesRouteInjectable,
});

export default servicesRouteComponentInjectable;
