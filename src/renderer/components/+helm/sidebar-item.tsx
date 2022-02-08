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
import { helmRoute, helmURL } from "../../../common/routes";
import networkRouteTabsInjectable from "./route-tabs.injectable";

export interface HelmSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedHelmSidebarItem = observer(({ routes }: Dependencies & HelmSidebarItemProps) => {
  const tabRoutes = routes.get();

  return (
    <SidebarItem
      id="helm"
      text="Helm"
      isActive={isActiveRoute(helmRoute)}
      url={helmURL()}
      icon={<Icon material="apps"/>}
    >
      {renderTabRoutesSidebarItems(tabRoutes)}
    </SidebarItem>
  );
});

export const HelmSidebarItem = withInjectables<Dependencies, HelmSidebarItemProps>(NonInjectedHelmSidebarItem, {
  getProps: (di, props) => ({
    routes: di.inject(networkRouteTabsInjectable),
    ...props,
  }),
});
