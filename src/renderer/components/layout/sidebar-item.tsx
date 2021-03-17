import "./sidebar-item.scss";

import React from "react";
import { computed } from "mobx";
import { cssNames, prevDefault } from "../../utils";
import { observer } from "mobx-react";
import { NavLink } from "react-router-dom";
import { Icon } from "../icon";
import { TabLayoutRoute } from "./tab-layout";
import { sidebarStorage } from "./sidebar-storage";
import { isActiveRoute } from "../../navigation";

interface SidebarItemProps {
  id: string; // Used to save nav item collapse/expand state in local storage
  url: string;
  text: React.ReactNode | string;
  className?: string;
  icon?: React.ReactNode;
  isHidden?: boolean;
  isActive?: boolean;
  subMenus?: TabLayoutRoute[];
}

@observer
export class SidebarItem extends React.Component<SidebarItemProps> {
  static displayName = "SidebarItem";

  get id(): string {
    return this.props.id; // unique id, used in storage and integration tests
  }

  get compact(): boolean {
    return Boolean(sidebarStorage.get().compact);
  }

  get expanded(): boolean {
    return Boolean(sidebarStorage.get().expanded[this.id]);
  }

  @computed get isExpandable(): boolean {
    const { subMenus, children } = this.props;
    const hasContent = subMenus?.length > 0 || children;

    return Boolean(hasContent && !this.compact) /*not available in compact-mode*/;
  }

  toggleExpand = () => {
    sidebarStorage.merge(draft => {
      draft.expanded[this.id] = !draft.expanded[this.id];
    });
  };

  render() {
    const { isHidden, isActive, subMenus = [], icon, text, children, url, className } = this.props;

    if (isHidden) return null;

    const { id, compact, expanded, isExpandable, toggleExpand } = this;
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
        {isExpandable && expanded && (
          <ul className={cssNames("sub-menu", { active: isActive })}>
            {subMenus.map(({ title, routePath, url = routePath }) => {
              const subItemId = `${id}${routePath}`;

              return (
                <SidebarItem
                  key={subItemId}
                  id={subItemId}
                  url={url}
                  text={title}
                  isActive={isActiveRoute({ path: url, exact: true })}
                />
              );
            })}
            {children}
          </ul>
        )}
      </div>
    );
  }
}
