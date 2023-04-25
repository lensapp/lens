/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { RuntimeClasses } from "./runtime-classes";
import runtimeClassesRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/runtime-classes/runtime-classes-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const runtimeClassesRouteComponentInjectable = getInjectable({
  id: "runtime-classes-route-component",

  instantiate: (di) => ({
    route: di.inject(runtimeClassesRouteInjectable),
    Component: RuntimeClasses,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default runtimeClassesRouteComponentInjectable;
