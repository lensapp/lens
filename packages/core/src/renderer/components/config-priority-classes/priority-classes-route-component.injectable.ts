/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { PriorityClasses } from "./priority-classes";
import priorityClassesRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/priority-classes/priority-classes-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const priorityClassesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "priority-classes-route-component",
  Component: PriorityClasses,
  routeInjectable: priorityClassesRouteInjectable,
});

export default priorityClassesRouteComponentInjectable;
