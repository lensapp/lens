import "./sidebar-nav-item.scss";

import React from "react";
import { computed, observable, reaction } from "mobx";
import { observer } from "mobx-react";
import { NavLink } from "react-router-dom";

import { createStorage, cssNames } from "../../utils";
import { Icon } from "../icon";
import { SidebarContext } from "./sidebar-context";

import type { TabLayoutRoute } from "./tab-layout";
import type { SidebarContextValue } from "./sidebar-context";

interface SidebarNavItemProps {
  id: string; // Used to save nav item collapse/expand state in local storage
  url: string;
  text: React.ReactNode | string;
  className?: string;
  icon?: React.ReactNode;
  isHidden?: boolean;
  isActive?: boolean;
  subMenus?: TabLayoutRoute[];
}

const navItemStorage = createStorage<[string, boolean][]>("sidebar_menu_item", []);
const navItemState = observable.map<string, boolean>(navItemStorage.get());

reaction(() => [...navItemState], (value) => navItemStorage.set(value));

@observer
export class SidebarNavItem extends React.Component<SidebarNavItemProps> {
  static contextType = SidebarContext;
  public context: SidebarContextValue;

  @computed get isExpanded() {
    return navItemState.get(this.props.id);
  }

  toggleSubMenu = () => {
    navItemState.set(this.props.id, !this.isExpanded);
  };

  render() {
    const { isHidden, isActive, subMenus = [], icon, text, url, children, className, id } = this.props;

    if (isHidden) {
      return null;
    }
    const extendedView = (subMenus.length > 0 || children) && this.context.pinned;

    if (extendedView) {
      return (
        <div className={cssNames("SidebarNavItem", className)} data-test-id={id}>
          <div className={cssNames("nav-item", { active: isActive })} onClick={this.toggleSubMenu}>
            {icon}
            <span className="link-text">{text}</span>
            <Icon className="expand-icon" material={this.isExpanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}/>
          </div>
          <ul className={cssNames("sub-menu", { active: isActive })}>
            {subMenus.map(({ title, url }) => (
              <NavLink key={url} to={url} className={cssNames({ visible: this.isExpanded })}>
                {title}
              </NavLink>
            ))}
            {React.Children.toArray(children).map((child: React.ReactElement<any>) => {
              return React.cloneElement(child, {
                className: cssNames(child.props.className, { visible: this.isExpanded }),
              });
            })}
          </ul>
        </div>
      );
    }

    return (
      <NavLink className={cssNames("SidebarNavItem", className)} to={url} isActive={() => isActive}>
        {icon}
        <span className="link-text">{text}</span>
      </NavLink>
    );
  }
}
