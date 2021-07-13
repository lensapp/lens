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

import "./sidebar-item.scss";

import React from "react";
import { computed, makeObservable } from "mobx";
import { cssNames, prevDefault } from "../../utils";
import { observer } from "mobx-react";
import { NavLink } from "react-router-dom";
import { Icon } from "../icon";
import { sidebarStorage } from "./sidebar-storage";
import { isActiveRoute } from "../../navigation";

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

@observer
export class SidebarItem extends React.Component<SidebarItemProps> {
  static displayName = "SidebarItem";

  constructor(props: SidebarItemProps) {
    super(props);
    makeObservable(this);
  }

  get id(): string {
    return this.props.id;
  }

  @computed get expanded(): boolean {
    return Boolean(sidebarStorage.get().expanded[this.id]);
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
    sidebarStorage.merge(draft => {
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
    const classNames = cssNames(SidebarItem.displayName, className);

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
