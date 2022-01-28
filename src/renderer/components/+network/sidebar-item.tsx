/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import networkRoutesInjectable from "./routes.injectable";
import { networkRoute, networkURL } from "../../../common/routes";
import { isActiveRoute } from "../../navigation";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar-item";
import { TabRouteTree } from "../layout/tab-route-tree";

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
      <TabRouteTree tabRoutes={tabRoutes} />
    </SidebarItem>
  );
});

export const NetworkSidebarItem = withInjectables<Dependencies, NetworkSidebarItemProps>(NonInjectedNetworkSidebarItem, {
  getProps: (di, props) => ({
    routes: di.inject(networkRoutesInjectable),
    ...props,
  }),
});
