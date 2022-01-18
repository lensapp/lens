/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./sidebar-item.scss";

import React from "react";
import { computed, makeObservable } from "mobx";
import { cssNames, prevDefault, StorageHelper } from "../../utils";
import { observer } from "mobx-react";
import { NavLink } from "react-router-dom";
import { Icon } from "../icon";
import { isActiveRoute } from "../../navigation";
import { withInjectables } from "@ogre-tools/injectable-react";
import sidebarStorageInjectable, { SidebarStorageState } from "./sidebar-storage/sidebar-storage.injectable";

interface SidebarItemProps {
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
}

interface Dependencies {
  sidebarStorage: StorageHelper<SidebarStorageState>
}

@observer
class NonInjectedSidebarItem extends React.Component<SidebarItemProps & Dependencies> {
  static displayName = "SidebarItem";

  constructor(props: SidebarItemProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  get id(): string {
    return this.props.id;
  }

  @computed get expanded(): boolean {
    return Boolean(this.props.sidebarStorage.get().expanded[this.id]);
  }

  @computed get isActive(): boolean {
    return this.props.isActive ?? isActiveRoute({
      path: this.props.url,
      exact: true,
    });
  }

  @computed get isExpandable(): boolean {
    return Boolean(this.props.children);
  }

  toggleExpand = () => {
    this.props.sidebarStorage.merge(draft => {
      draft.expanded[this.id] = !draft.expanded[this.id];
    });
  };

  renderSubMenu() {
    const { isExpandable, expanded, isActive } = this;

    if (!isExpandable || !expanded) {
      return null;
    }

    return (
      <ul className={cssNames("sub-menu", { active: isActive })}>
        {this.props.children}
      </ul>
    );
  }

  render() {
    const { isHidden, icon, text, url, className } = this.props;

    if (isHidden) return null;

    const { isActive, id, expanded, isExpandable, toggleExpand } = this;
    const classNames = cssNames("SidebarItem", className);

    return (
      <div className={classNames} data-test-id={id}>
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
        {this.renderSubMenu()}
      </div>
    );
  }
}

export const SidebarItem = withInjectables<Dependencies, SidebarItemProps>(
  NonInjectedSidebarItem,

  {
    getProps: (di, props) => ({
      sidebarStorage: di.inject(sidebarStorageInjectable),
      ...props,
    }),
  },
);
