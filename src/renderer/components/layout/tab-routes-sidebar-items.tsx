/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { isActiveRoute } from "../../navigation";
import { SidebarItem } from "./sidebar-item";
import type { TabLayoutRoute } from "./tab-layout";

function withId(src: TabLayoutRoute) {
  return {
    ...src,
    id: `tab-route-item-${src.url ?? src.routePath}`,
  };
}

/**
 * Renders a sidebar item for each route
 *
 * NOTE: this cannot be a component because then the `<SidebarItem>.isExandable`
 * check will always return true because a component that renders to `null` is
 * still a present child to the parent `<SidebarItem>`
 */
export const renderTabRoutesSidebarItems = (routes: TabLayoutRoute[]) => (
  routes
    .map(withId)
    .map(({ title, routePath, url = routePath, exact = true, id }) => (
      <SidebarItem
        key={id}
        id={id}
        url={url}
        text={title}
        isActive={isActiveRoute({ path: routePath, exact })}
      />
    ))
);
