/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ParametersFromRouteInjectable } from "../../front-end-route-injection-token";
import { getFrontEndRouteInjectable } from "../../front-end-route-injection-token";

export type CatalogPathParameters = ParametersFromRouteInjectable<typeof catalogRouteInjectable>;

const catalogRouteInjectable = getFrontEndRouteInjectable({
  id: "catalog-route",
  path: "/catalog/:group?/:kind?",
  clusterFrame: false,
});

export default catalogRouteInjectable;
