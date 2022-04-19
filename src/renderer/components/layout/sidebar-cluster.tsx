/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./sidebar-cluster.module.scss";
import { observable } from "mobx";
import React, { useState } from "react";
import { broadcastMessage } from "../../../common/ipc";
import type { CatalogEntity, CatalogEntityContextMenu } from "../../api/catalog-entity";
import { IpcRendererNavigationEvents } from "../../navigation/events";
import { Avatar } from "../avatar";
import { Icon } from "../icon";
import { Menu, MenuItem } from "../menu";
import { Tooltip } from "../tooltip";
import { withInjectables } from "@ogre-tools/injectable-react";
import hotbarStoreInjectable from "../../../common/hotbar-store.injectable";
import type { HotbarStore } from "../../../common/hotbar-store";
import type { Navigate } from "../../navigation/navigate.injectable";
import type { NormalizeCatalogEntityContextMenu } from "../../catalog/normalize-menu-item.injectable";
import navigateInjectable from "../../navigation/navigate.injectable";
import normalizeCatalogEntityContextMenuInjectable from "../../catalog/normalize-menu-item.injectable";

export interface SidebarClusterProps {
  clusterEntity: CatalogEntity;
}

interface Dependencies {
  navigate: Navigate;
  normalizeMenuItem: NormalizeCatalogEntityContextMenu;
  hotbarStore: HotbarStore;
}

function NonInjectedSidebarCluster({
  clusterEntity,
  hotbarStore,
  navigate,
  normalizeMenuItem,
}: SidebarClusterProps & Dependencies) {
  const [opened, setOpened] = useState(false);
  const [menuItems] = useState(observable.array<CatalogEntityContextMenu>());

  if (!clusterEntity) {
    // render a Loading version of the SidebarCluster
    return (
      <div className={styles.SidebarCluster}>
        <Avatar
          title="??"
          background="var(--halfGray)"
          size={40}
          className={styles.loadingAvatar}
        />
        <div className={styles.loadingClusterName} />
      </div>
    );
  }

  const onMenuOpen = () => {
    const isAddedToActive = hotbarStore.isAddedToActive(clusterEntity);
    const title = isAddedToActive
      ? "Remove from Hotbar"
      : "Add to Hotbar";
    const onClick = isAddedToActive
      ? () => hotbarStore.removeFromHotbar(clusterEntity.getId())
      : () => hotbarStore.addToHotbar(clusterEntity);

    menuItems.replace([{ title, onClick }]);
    clusterEntity.onContextMenuOpen({
      menuItems,
      navigate: (url, forceMainFrame = true) => {
        if (forceMainFrame) {
          broadcastMessage(IpcRendererNavigationEvents.NAVIGATE_IN_APP, url);
        } else {
          navigate(url);
        }
      },
    });

    toggle();
  };

  const onKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    if (evt.code == "Space") {
      toggle();
    }
  };

  const toggle = () => {
    setOpened(!opened);
  };

  const id = `cluster-${clusterEntity.getId()}`;
  const tooltipId = `tooltip-${id}`;

  return (
    <div
      id={id}
      className={styles.SidebarCluster}
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="menubar"
      data-testid="sidebar-cluster-dropdown"
    >
      <Avatar
        title={clusterEntity.getName()}
        colorHash={`${clusterEntity.getName()}-${clusterEntity.metadata.source}`}
        size={40}
        src={clusterEntity.spec.icon?.src}
        className={styles.avatar}
      />
      <div className={styles.clusterName} id={tooltipId}>
        {clusterEntity.getName()}
      </div>
      <Tooltip targetId={tooltipId}>
        {clusterEntity.getName()}
      </Tooltip>
      <Icon material="arrow_drop_down" className={styles.dropdown}/>
      <Menu
        usePortal
        htmlFor={id}
        isOpen={opened}
        open={onMenuOpen}
        closeOnClickItem
        closeOnClickOutside
        close={toggle}
        className={styles.menu}
      >
        {
          menuItems
            .map(normalizeMenuItem)
            .map((menuItem) => (
              <MenuItem key={menuItem.title} onClick={menuItem.onClick}>
                {menuItem.title}
              </MenuItem>
            ))
        }
      </Menu>
    </div>
  );
}

export const SidebarCluster = withInjectables<Dependencies, SidebarClusterProps>(NonInjectedSidebarCluster, {
  getProps: (di, props) => ({
    ...props,
    hotbarStore: di.inject(hotbarStoreInjectable),
    navigate: di.inject(navigateInjectable),
    normalizeMenuItem: di.inject(normalizeCatalogEntityContextMenuInjectable),
  }),
});
