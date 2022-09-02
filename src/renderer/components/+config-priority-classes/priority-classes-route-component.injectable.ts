/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { PriorityClasses } from "./priority-classes";
import priorityClassesRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/priority-classes/priority-classes-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const podDisruptionBudgetsRouteComponentInjectable = getInjectable({
  id: "priority-classes-route-component",

  instantiate: (di) => ({
    route: di.inject(priorityClassesRouteInjectable),
    Component: PriorityClasses,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default podDisruptionBudgetsRouteComponentInjectable;
