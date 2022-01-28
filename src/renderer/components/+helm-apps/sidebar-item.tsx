/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { appsRoute, appsURL } from "../../../common/routes";
import { isActiveRoute } from "../../navigation";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar-item";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { TabRouteTree } from "../layout/tab-route-tree";
import helmAppRoutesInjectable from "./routes.injectable";

export interface AppsSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedAppsSidebarItem = observer(({ routes }: Dependencies & AppsSidebarItemProps) => {
  const tabRoutes = routes.get();

  return (
    <SidebarItem
      id="apps"
      text="Helm Apps"
      isActive={isActiveRoute(appsRoute)}
      url={appsURL()}
      icon={<Icon material="apps"/>}
    >
      <TabRouteTree tabRoutes={tabRoutes} />
    </SidebarItem>
  );
});

export const HelmAppsSidebarItem = withInjectables<Dependencies, AppsSidebarItemProps>(NonInjectedAppsSidebarItem, {
  getProps: (di, props) => ({
    routes: di.inject(helmAppRoutesInjectable),
    ...props,
  }),
});
