/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import styles from "./sidebar-cluster.module.css";
import { observable } from "mobx";
import React, { useState } from "react";
import { HotbarStore } from "../../../common/hotbar-store";
import { broadcastMessage } from "../../../common/ipc";
import type { CatalogEntity, CatalogEntityContextMenu, CatalogEntityContextMenuContext } from "../../api/catalog-entity";
import { IpcRendererNavigationEvents } from "../../navigation/events";
import { Avatar } from "../avatar/avatar";
import { Icon } from "../icon";
import { navigate } from "../../navigation";
import { Menu, MenuItem } from "../menu";
import { ConfirmDialog } from "../confirm-dialog";

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

export function SidebarCluster({ clusterEntity }: { clusterEntity: CatalogEntity }) {
  const [opened, setOpened] = useState(false);

  if (!clusterEntity) {
    return null;
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
        width={40}
        height={40}
        src={spec.icon?.src}
        className={styles.avatar}
      />
      <div className={styles.clusterName}>
        {metadata.name}
      </div>
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
