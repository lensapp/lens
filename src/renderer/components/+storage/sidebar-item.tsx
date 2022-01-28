/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { storageRoute, storageURL } from "../../../common/routes";
import { isActiveRoute } from "../../navigation";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar-item";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { TabRouteTree } from "../layout/tab-route-tree";
import storageRoutesInjectable from "./routes.injectable";

export interface StorageSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
}

const NonInjectedStorageSidebarItem = observer(({ routes }: Dependencies & StorageSidebarItemProps) => {
  const tabRoutes = routes.get();

  return (
    <SidebarItem
      id="storage"
      text="Storage"
      isActive={isActiveRoute(storageRoute)}
      isHidden={tabRoutes.length == 0}
      url={storageURL()}
      icon={<Icon svg="storage"/>}
    >
      <TabRouteTree tabRoutes={tabRoutes} />
    </SidebarItem>
  );
});

export const StorageSidebarItem = withInjectables<Dependencies, StorageSidebarItemProps>(NonInjectedStorageSidebarItem, {
  getProps: (di, props) => ({
    routes: di.inject(storageRoutesInjectable),
    ...props,
  }),
});
