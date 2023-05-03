/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Events } from "./events";
import eventsRouteInjectable from "../../../common/front-end-routing/routes/cluster/events/events-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const eventsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "events-route-component",
  Component: Events,
  routeInjectable: eventsRouteInjectable,
});

export default eventsRouteComponentInjectable;
