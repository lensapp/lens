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
import { TabRouteTree } from "../layout/tab-route-tree";
import configRoutesInjectable from "./routes.injectable";

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
      <TabRouteTree tabRoutes={tabRoutes} />
    </SidebarItem>
  );
});

export const ConfigSidebarItem = withInjectables<Dependencies, ConfigSidebarItemProps>(NonInjectedConfigSidebarItem, {
  getProps: (di, props) => ({
    routes: di.inject(configRoutesInjectable),
    ...props,
  }),
});
