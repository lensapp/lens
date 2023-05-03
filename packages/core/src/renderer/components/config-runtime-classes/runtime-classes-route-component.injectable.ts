/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { RuntimeClasses } from "./runtime-classes";
import runtimeClassesRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/runtime-classes/runtime-classes-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const runtimeClassesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "runtime-classes-route-component",
  routeInjectable: runtimeClassesRouteInjectable,
  Component: RuntimeClasses,
});

export default runtimeClassesRouteComponentInjectable;
