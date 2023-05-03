/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Secrets } from "./secrets";
import secretsRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/secrets/secrets-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const secretsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "secrets-route-component",
  Component: Secrets,
  routeInjectable: secretsRouteInjectable,
});

export default secretsRouteComponentInjectable;
