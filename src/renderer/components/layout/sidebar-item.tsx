import "./sidebar-item.scss";

import React from "react";
import { computed } from "mobx";
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

  get id(): string {
    return this.props.id;
  }

  @computed get compact(): boolean {
    return Boolean(sidebarStorage.get().compact);
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
    if (this.compact) return false; // not available in compact-mode currently

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
      return;
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

    const { isActive, id, compact, expanded, isExpandable, toggleExpand } = this;
    const classNames = cssNames(SidebarItem.displayName, className, {
      compact,
    });

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
