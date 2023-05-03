/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { ConfigMaps } from "./config-maps";
import configMapsRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/config-maps/config-maps-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const configMapsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "config-maps-route-component",
  Component: ConfigMaps,
  routeInjectable: configMapsRouteInjectable,
});

export default configMapsRouteComponentInjectable;
