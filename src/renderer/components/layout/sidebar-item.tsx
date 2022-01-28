/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./sidebar-item.scss";

import React from "react";
import { cssNames, prevDefault, StorageLayer } from "../../utils";
import { observer } from "mobx-react";
import { NavLink } from "react-router-dom";
import { Icon } from "../icon";
import { isActiveRoute } from "../../navigation";
import { withInjectables } from "@ogre-tools/injectable-react";
import sidebarStorageInjectable, { SidebarStorageState } from "./sidebar-storage.injectable";

export interface SidebarItemProps {
  /**
   * Unique id, used in storage and integration tests
   */
  id: string;
  url: string;
  className?: string;
  text: React.ReactNode;
  icon?: React.ReactNode;
  isHidden?: boolean;
  /**
   * Forces this item to be also show as active or not.
   *
   * Default: dynamically checks the location against the `url` props to determine if
   * this item should be shown as active
   */
  isActive?: boolean;
  children?: React.ReactNode | React.ReactChild | React.ReactChild[];
}

interface Dependencies {
  sidebarStorage: StorageLayer<SidebarStorageState>;
}

const NonInjectedSidebarItem = observer(({
  id,
  url,
  className,
  text,
  icon,
  isHidden,
  sidebarStorage,
  isActive: forcedActive,
  children,
}: Dependencies & SidebarItemProps) => {
  const expanded = Boolean(sidebarStorage.get().expanded[id]);
  const isActive = forcedActive || isActiveRoute({
    path: url,
    exact: true,
  });
  const isExpandable = Boolean(children);

  if (isHidden) {
    return null;
  }

  const toggleExpand = () => {
    sidebarStorage.merge(draft => {
      draft.expanded[id] = !draft.expanded[id];
    });
  };
  const renderSubMenu = () => {
    if (!isExpandable || !expanded) {
      return null;
    }

    return (
      <ul className={cssNames("sub-menu", { active: isActive })}>
        {children}
      </ul>
    );
  };

  return (
    <div className={cssNames(SidebarItem.displayName, className)} data-test-id={id}>
      <NavLink
        to={url}
        isActive={() => isActive}
        className={cssNames("nav-item flex gaps align-center", { expandable: isExpandable })}
        onClick={isExpandable ? prevDefault(toggleExpand) : undefined}>
        {icon}
        <span className="link-text box grow">{text}</span>
        {isExpandable && <Icon
          className="expand-icon box right"
          material={expanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}
        />}
      </NavLink>
      {renderSubMenu()}
    </div>
  );
});

export const SidebarItem = withInjectables<Dependencies, SidebarItemProps>(NonInjectedSidebarItem, {
  getProps: (di, props) => ({
    sidebarStorage: di.inject(sidebarStorageInjectable),
    ...props,
  }),
});

SidebarItem.displayName = "SidebarItem";
