/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from  "./sidebar-items.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { NavLink } from "react-router-dom";
import { Icon } from "@k8slens/icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SidebarStorageState } from "./sidebar-storage/sidebar-storage.injectable";
import sidebarStorageInjectable from "./sidebar-storage/sidebar-storage.injectable";
import type { SidebarItemDeclaration } from "@k8slens/cluster-sidebar";
import type { StorageLayer } from "../../utils/storage-helper";

interface Dependencies {
  sidebarStorage: StorageLayer<SidebarStorageState>;
}

export interface SidebarItemProps {
  item: SidebarItemDeclaration;
}

const NonInjectedSidebarItem = observer((props: SidebarItemProps & Dependencies) => {
  const { item, sidebarStorage } = props;
  const id = item.id;
  const expanded = sidebarStorage.get().expanded[id] ?? false;
  const isExpandable = item.children.length > 0 && item.children.some(item => item.isVisible.get());
  const isActive = item.isActive.get();

  const toggleExpand = () => {
    sidebarStorage.merge((draft) => {
      draft.expanded[id] = !draft.expanded[id];
    });
  };
  const renderSubMenu = () => {
    if (!isExpandable || !expanded) {
      return null;
    }

    return (
      <div className={styles.subMenu}>
        {item.children.map((child) => (
          <SidebarItem key={child.id} item={child} />
        ))}
      </div>
    );
  };

  if (!item.isVisible.get()) {
    return null;
  }

  return (
    <div
      className={styles.SidebarItem}
      data-testid={id}
      data-is-active-test={isActive}
      data-parent-id-test={item.parentId}
    >
      <NavLink
        to={""}
        isActive={() => isActive}
        className={styles.navItem}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          if (isExpandable) {
            toggleExpand();
          } else {
            item.onClick();
          }
        }}
        data-testid={`link-for-${id}`}
      >
        {item.getIcon?.()}
        <span>{item.title}</span>
        {isExpandable && (
          <Icon
            className={styles.expandIcon}
            material={expanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}
            data-testid={`expand-icon-for-${id}`}
          />
        )}
      </NavLink>
      {renderSubMenu()}
    </div>
  );
});

export const SidebarItem = withInjectables<Dependencies, SidebarItemProps>(NonInjectedSidebarItem, {
  getProps: (di, props) => ({
    ...props,
    sidebarStorage: di.inject(sidebarStorageInjectable),
  }),
});

SidebarItem.displayName = "SidebarItem";
