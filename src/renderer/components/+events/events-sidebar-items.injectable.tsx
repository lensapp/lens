/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import React from "react";
import {
  SidebarItemRegistration,
  sidebarItemsInjectionToken,
} from "../layout/sidebar-items.injectable";
import { Icon } from "../icon";

import eventsRouteInjectable from "../../../common/front-end-routing/routes/cluster/events/events-route.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToEventsInjectable from "../../../common/front-end-routing/routes/cluster/events/navigate-to-events.injectable";

const eventsSidebarItemsInjectable = getInjectable({
  id: "events-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(eventsRouteInjectable);
    const navigateToEvents = di.inject(navigateToEventsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed((): SidebarItemRegistration[] => [
      {
        id: "events",
        parentId: null,
        getIcon: () => <Icon material="access_time" />,
        title: "Events",
        onClick: navigateToEvents,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 80,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default eventsSidebarItemsInjectable;
