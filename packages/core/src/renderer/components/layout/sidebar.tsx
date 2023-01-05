/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./sidebar.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { SidebarItem } from "./sidebar-item";
import type { CatalogEntityRegistry } from "../../api/catalog/entity/registry";
import { SidebarCluster } from "./sidebar-cluster";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { HierarchicalSidebarItem } from "./sidebar-items.injectable";
import sidebarItemsInjectable from "./sidebar-items.injectable";
import type { IComputedValue } from "mobx";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";

interface Dependencies {
  sidebarItems: IComputedValue<HierarchicalSidebarItem[]>;
  entityRegistry: CatalogEntityRegistry;
}

export const NonInjectedSidebar = observer(({
  sidebarItems,
  entityRegistry,
}: Dependencies) => (
  <div className={cssNames("flex flex-col")} data-testid="cluster-sidebar">
    <SidebarCluster clusterEntity={entityRegistry.activeEntity} />

    <div className={`${styles.sidebarNav} sidebar-active-status`}>
      {
        sidebarItems.get()
          .map(hierarchicalSidebarItem => (
            <SidebarItem
              item={hierarchicalSidebarItem}
              key={hierarchicalSidebarItem.registration.id}
            />
          ))
      }
    </div>
  </div>
));

export const Sidebar = withInjectables<Dependencies>(NonInjectedSidebar, {
  getProps: (di, props) => ({
    ...props,
    sidebarItems: di.inject(sidebarItemsInjectable),
    entityRegistry: di.inject(catalogEntityRegistryInjectable),
  }),
});

Sidebar.displayName = "Sidebar";
