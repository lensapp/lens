/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Catalog } from "./catalog";
import catalogRouteInjectable from "../../../common/front-end-routing/routes/catalog/catalog-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const catalogRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "catalog-route-component",
  Component: Catalog,
  routeInjectable: catalogRouteInjectable,
});

export default catalogRouteComponentInjectable;
