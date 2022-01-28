/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { isActiveRoute } from "../../navigation";
import { SidebarItem } from "./sidebar-item";
import type { TabLayoutRoute } from "./tab-layout";

export const TabRouteTree = ({ tabRoutes }: { tabRoutes: TabLayoutRoute[] }) => {
  return (
    <>
      {
        tabRoutes.map(({ title, routePath, url = routePath, exact = true }) => {
          const subMenuItemId = `tab-route-item-${url}`;

          return (
            <SidebarItem
              key={subMenuItemId}
              id={subMenuItemId}
              url={url}
              text={title}
              isActive={isActiveRoute({ path: routePath, exact })}
            />
          );
        })
      }
    </>
  );
};
