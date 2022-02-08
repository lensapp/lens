/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import { isActiveRoute } from "../../navigation";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar-item";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { renderTabRoutesSidebarItems } from "../layout/tab-routes-sidebar-items";
import { networkRoute, networkURL } from "../../../common/routes";
import networkRouteTabsInjectable from "./route-tabs.injectable";

export interface NetworkSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedNetworkSidebarItem = observer(({ routes }: Dependencies & NetworkSidebarItemProps) => {
  const tabRoutes = routes.get();

  return (
    <SidebarItem
      id="networks"
      text="Network"
      isActive={isActiveRoute(networkRoute)}
      isHidden={tabRoutes.length == 0}
      url={networkURL()}
      icon={<Icon material="device_hub"/>}
    >
      {renderTabRoutesSidebarItems(tabRoutes)}
    </SidebarItem>
  );
});

export const NetworkSidebarItem = withInjectables<Dependencies, NetworkSidebarItemProps>(NonInjectedNetworkSidebarItem, {
  getProps: (di, props) => ({
    routes: di.inject(networkRouteTabsInjectable),
    ...props,
  }),
});
