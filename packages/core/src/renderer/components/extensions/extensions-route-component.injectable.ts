/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Extensions } from "./extensions";
import extensionsRouteInjectable from "../../../common/front-end-routing/routes/extensions/extensions-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const extensionsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "extensions-route-component",
  Component: Extensions,
  routeInjectable: extensionsRouteInjectable,
});

export default extensionsRouteComponentInjectable;
