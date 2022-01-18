/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./sidebar-cluster.module.scss";
import { observable } from "mobx";
import React, { useState } from "react";
import { HotbarStore } from "../../../common/hotbar-store";
import { broadcastMessage } from "../../../common/ipc";
import type { CatalogEntity, CatalogEntityContextMenu, CatalogEntityContextMenuContext } from "../../api/catalog-entity";
import { IpcRendererNavigationEvents } from "../../navigation/events";
import { Avatar } from "../avatar";
import { Icon } from "../icon";
import { navigate } from "../../navigation";
import { Menu, MenuItem } from "../menu";
import { ConfirmDialog } from "../confirm-dialog";
import { Tooltip } from "../tooltip";

const contextMenu: CatalogEntityContextMenuContext = observable({
  menuItems: [],
  navigate: (url: string, forceMainFrame = true) => {
    if (forceMainFrame) {
      broadcastMessage(IpcRendererNavigationEvents.NAVIGATE_IN_APP, url);
    } else {
      navigate(url);
    }
  },
});

function onMenuItemClick(menuItem: CatalogEntityContextMenu) {
  if (menuItem.confirm) {
    ConfirmDialog.open({
      okButtonProps: {
        primary: false,
        accent: true,
      },
      ok: () => {
        menuItem.onClick();
      },
      message: menuItem.confirm.message,
    });
  } else {
    menuItem.onClick();
  }
}

function renderLoadingSidebarCluster() {
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

export function SidebarCluster({ clusterEntity }: { clusterEntity: CatalogEntity }) {
  const [opened, setOpened] = useState(false);

  if (!clusterEntity) {
    return renderLoadingSidebarCluster();
  }

  const onMenuOpen = () => {
    const hotbarStore = HotbarStore.getInstance();
    const isAddedToActive = HotbarStore.getInstance().isAddedToActive(clusterEntity);
    const title = isAddedToActive
      ? "Remove from Hotbar"
      : "Add to Hotbar";
    const onClick = isAddedToActive
      ? () => hotbarStore.removeFromHotbar(metadata.uid)
      : () => hotbarStore.addToHotbar(clusterEntity);

    contextMenu.menuItems = [{ title, onClick }];
    clusterEntity.onContextMenuOpen(contextMenu);

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

  const { metadata, spec } = clusterEntity;
  const id = `cluster-${metadata.uid}`;
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
        title={metadata.name}
        colorHash={`${metadata.name}-${metadata.source}`}
        size={40}
        src={spec.icon?.src}
        className={styles.avatar}
      />
      <div className={styles.clusterName} id={tooltipId}>
        {metadata.name}
      </div>
      <Tooltip targetId={tooltipId}>
        {metadata.name}
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
          contextMenu.menuItems.map((menuItem) => (
            <MenuItem key={menuItem.title} onClick={() => onMenuItemClick(menuItem)}>
              {menuItem.title}
            </MenuItem>
          ))
        }
      </Menu>
    </div>
  );
}
