/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { CustomResources } from "./view";
import customResourcesRouteInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/custom-resources-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const customResourcesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "custom-resources-route-component",
  Component: CustomResources,
  routeInjectable: customResourcesRouteInjectable,
});

export default customResourcesRouteComponentInjectable;
