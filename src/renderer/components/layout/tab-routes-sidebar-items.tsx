/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { isActiveRoute } from "../../navigation";
import { SidebarItem } from "./sidebar-item";
import type { TabLayoutRoute } from "./tab-layout";

export interface SidebarTreeProps {
  routes: TabLayoutRoute[];
}

function withId(src: TabLayoutRoute) {
  return {
    ...src,
    id: `tab-route-item-${src.url ?? src.routePath}`,
  };
}

export const TabRoutesSidebarItems = ({ routes }: SidebarTreeProps) => (
  <>
    {
      routes
        .map(withId)
        .map(({ title, routePath, url = routePath, exact = true, id }) => (
          <SidebarItem
            key={id}
            id={id}
            url={url}
            text={title}
            isActive={isActiveRoute({ path: routePath, exact })} />
        ))
    }
  </>
);
