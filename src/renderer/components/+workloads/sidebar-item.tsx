/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import { workloadsRoute, workloadsURL } from "../../../common/routes";
import { isActiveRoute } from "../../navigation";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar-item";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { TabRoutesSidebarItems } from "../layout/tab-routes-sidebar-items";
import workloadsRouteTabsInjectable from "./route-tabs.injectable";

export interface WorkloadSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedWorkloadsSidebarItem = observer(({ routes }: Dependencies & WorkloadSidebarItemProps) => {
  const tabRoutes = routes.get();

  return (
    <SidebarItem
      id="workloads"
      text="Workloads"
      isActive={isActiveRoute(workloadsRoute)}
      isHidden={tabRoutes.length == 0}
      url={workloadsURL()}
      icon={<Icon svg="workloads"/>}
    >
      <TabRoutesSidebarItems routes={tabRoutes} />
    </SidebarItem>
  );
});

export const WorkloadsSidebarItem = withInjectables<Dependencies, WorkloadSidebarItemProps>(NonInjectedWorkloadsSidebarItem, {
  getProps: (di, props) => ({
    routes: di.inject(workloadsRouteTabsInjectable),
    ...props,
  }),
});
