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
import { observer } from "mobx-react";

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

export const SidebarCluster = observer(({ clusterEntity }: { clusterEntity: CatalogEntity }) => {
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
      ? () => hotbarStore.removeFromHotbar(clusterEntity.getId())
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
          contextMenu.menuItems.map((menuItem) => (
            <MenuItem key={menuItem.title} onClick={() => onMenuItemClick(menuItem)}>
              {menuItem.title}
            </MenuItem>
          ))
        }
      </Menu>
    </div>
  );
});
