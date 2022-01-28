/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { workloadsRoute, workloadsURL } from "../../../common/routes";
import { isActiveRoute } from "../../navigation";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar-item";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { TabRouteTree } from "../layout/tab-route-tree";
import workloadRoutesInjectable from "./routes.injectable";

export interface WorkloadsSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedWorkloadsSidebarItem = observer(({ routes }: Dependencies & WorkloadsSidebarItemProps) => {
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
      <TabRouteTree tabRoutes={tabRoutes} />
    </SidebarItem>
  );
});

export const WorkloadsSidebarItem = withInjectables<Dependencies, WorkloadsSidebarItemProps>(NonInjectedWorkloadsSidebarItem, {
  getProps: (di, props) => ({
    routes: di.inject(workloadRoutesInjectable),
    ...props,
  }),
});
