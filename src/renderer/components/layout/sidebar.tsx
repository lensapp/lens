/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./sidebar.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { SidebarItem } from "./sidebar-item";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { SidebarCluster } from "./sidebar-cluster";
import { withInjectables } from "@ogre-tools/injectable-react";
import sidebarItemsInjectable, {
  HierarchicalSidebarItem,
} from "./sidebar-items.injectable";
import type { IComputedValue } from "mobx";

interface Dependencies {
  sidebarItems: IComputedValue<HierarchicalSidebarItem[]>;
}

@observer
class NonInjectedSidebar extends React.Component<Dependencies> {
  static displayName = "Sidebar";

  get clusterEntity() {
    return catalogEntityRegistry.activeEntity;
  }

  render() {
    return (
      <div className={cssNames("flex flex-col")} data-testid="cluster-sidebar">
        <SidebarCluster clusterEntity={this.clusterEntity} />

        <div className={`${styles.sidebarNav} sidebar-active-status`}>
          {this.props.sidebarItems.get().map((
            hierarchicalSidebarItem: HierarchicalSidebarItem,
          ) => (
            <SidebarItem
              item={hierarchicalSidebarItem}
              key={hierarchicalSidebarItem.registration.id}
            />
          ))}
        </div>
      </div>
    );
  }
}

export const Sidebar = withInjectables<Dependencies>(
  NonInjectedSidebar,

  {
    getProps: (di, props) => ({
      sidebarItems: di.inject(sidebarItemsInjectable),
      ...props,
    }),
  },
);



