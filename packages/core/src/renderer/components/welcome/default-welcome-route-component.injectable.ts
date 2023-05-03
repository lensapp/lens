/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Welcome } from "./welcome";
import defaultWelcomeRouteInjectable from "../../../common/front-end-routing/routes/welcome/default-welcome-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const defaultWelcomeRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "default-welcome-route-component",
  Component: Welcome,
  routeInjectable: defaultWelcomeRouteInjectable,
});

export default defaultWelcomeRouteComponentInjectable;
