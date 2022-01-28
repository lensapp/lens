/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { usersManagementRoute, usersManagementURL } from "../../../common/routes";
import { isActiveRoute } from "../../navigation";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar-item";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { TabRouteTree } from "../layout/tab-route-tree";
import userManagementRoutesInjectable from "./routes.injectable";

export interface UserManagementSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedUserManagementSidebarItem = observer(({ routes }: Dependencies & UserManagementSidebarItemProps) => {
  const tabRoutes = routes.get();

  return (
    <SidebarItem
      id="users"
      text="Access Control"
      isActive={isActiveRoute(usersManagementRoute)}
      isHidden={tabRoutes.length === 0}
      url={usersManagementURL()}
      icon={<Icon material="security"/>}
    >
      <TabRouteTree tabRoutes={tabRoutes} />
    </SidebarItem>
  );
});

export const UserManagementSidebarItem = withInjectables<Dependencies, UserManagementSidebarItemProps>(NonInjectedUserManagementSidebarItem, {
  getProps: (di, props) => ({
    routes: di.inject(userManagementRoutesInjectable),
    ...props,
  }),
});
