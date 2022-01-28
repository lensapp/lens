/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./sidebar-cluster.module.scss";
import { observable } from "mobx";
import React, { useState } from "react";
import { broadcastMessage } from "../../../common/ipc";
import { IpcRendererNavigationEvents } from "../../navigation/events";
import { Avatar } from "../avatar";
import { Icon } from "../icon";
import { navigate } from "../../navigation";
import { Menu } from "../menu";
import { Tooltip } from "../tooltip";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import type { CatalogEntity, CatalogEntityContextMenu, CatalogEntityContextMenuContext } from "../../../common/catalog";
import renderEntityContextMenuItemInjectable, { RenderEntityContextMenuItem } from "../../catalog/render-context-menu-item.injectable";
import onEntityContextMenuOpenInjectable from "../../catalog/on-entity-context-menu-open.injectable";
import addToActiveHotbarInjectable from "../../../common/hotbar-store/add-to-active-hotbar.injectable";
import removeByIdFromActiveHotbarInjectable from "../../../common/hotbar-store/remove-from-active-hotbar.injectable";
import isItemInActiveHotbarInjectable from "../../../common/hotbar-store/is-added-to-active-hotbar.injectable";

export interface SidebarClusterProps {
  clusterEntity: CatalogEntity | null | undefined;
}

interface Dependencies {
  renderEntityContextMenuItem: RenderEntityContextMenuItem;
  onEntityContextMenuOpen: (entity: CatalogEntity, context: CatalogEntityContextMenuContext) => void;
  isAddedToActiveHotbar: (entity: CatalogEntity) => boolean;
  removeFromActiveHotbar: (entityId: string) => void;
  addToActiveHotbar: (entity: CatalogEntity) => void;
}

const NonInjectedSidebarCluster = observer(({
  clusterEntity,
  renderEntityContextMenuItem,
  onEntityContextMenuOpen,
  isAddedToActiveHotbar,
  removeFromActiveHotbar,
  addToActiveHotbar,
}: Dependencies & SidebarClusterProps) => {
  const [opened, setOpened] = useState(false);
  const [contextMenuItems] = useState(observable.array<CatalogEntityContextMenu>());

  if (!clusterEntity) {
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
    contextMenuItems.replace([
      isAddedToActiveHotbar(clusterEntity)
        ? {
          title:  "Remove from Hotbar",
          onClick: () => removeFromActiveHotbar(metadata.uid),
        }
        : {
          title:  "Add to Hotbar",
          onClick: () => addToActiveHotbar(clusterEntity),
        },
    ]);

    onEntityContextMenuOpen(clusterEntity, {
      menuItems: contextMenuItems,
      navigate: (url: string, forceMainFrame = true) => {
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
        {contextMenuItems.map(renderEntityContextMenuItem("title"))}
      </Menu>
    </div>
  );
});

export const SidebarCluster = withInjectables<Dependencies, SidebarClusterProps>(NonInjectedSidebarCluster, {
  getProps: (di, props) => ({
    renderEntityContextMenuItem: di.inject(renderEntityContextMenuItemInjectable),
    onEntityContextMenuOpen: di.inject(onEntityContextMenuOpenInjectable),
    addToActiveHotbar: di.inject(addToActiveHotbarInjectable),
    removeFromActiveHotbar: di.inject(removeByIdFromActiveHotbarInjectable),
    isAddedToActiveHotbar: di.inject(isItemInActiveHotbarInjectable),
    ...props,
  }),
});

