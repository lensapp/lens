/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { configRoute, configURL } from "../../../common/routes";
import { isActiveRoute } from "../../navigation";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar-item";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { TabRoutesSidebarItems } from "../layout/tab-routes-sidebar-items";
import configRoutesInjectable from "./route-tabs.injectable";

export interface ConfigSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedConfigSidebarItem = observer(({ routes }: Dependencies & ConfigSidebarItemProps) => {
  const tabRoutes = routes.get();

  return (
    <SidebarItem
      id="config"
      text="Configuration"
      isActive={isActiveRoute(configRoute)}
      isHidden={tabRoutes.length == 0}
      url={configURL()}
      icon={<Icon material="list"/>}
    >
      <TabRoutesSidebarItems routes={tabRoutes} />
    </SidebarItem>
  );
});

export const ConfigSidebarItem = withInjectables<Dependencies, ConfigSidebarItemProps>(NonInjectedConfigSidebarItem, {
  getProps: (di, props) => ({
    routes: di.inject(configRoutesInjectable),
    ...props,
  }),
});
