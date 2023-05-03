/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { ServiceAccounts } from "./view";
import serviceAccountsRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/service-accounts/service-accounts-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../../routes/route-specific-component-injection-token";

const serviceAccountsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "service-accounts-route-component",
  Component: ServiceAccounts,
  routeInjectable: serviceAccountsRouteInjectable,
});

export default serviceAccountsRouteComponentInjectable;
