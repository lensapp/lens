import "./sidebar-item.scss";

import React from "react";
import { cssNames, prevDefault } from "../../utils";
import { observer } from "mobx-react";
import { NavLink } from "react-router-dom";
import { Icon } from "../icon";
import { TabLayoutRoute } from "./tab-layout";
import { sidebarLocalStorage } from "./sidebar-storage";

interface SidebarItemProps {
  id: string; // Used to save nav item collapse/expand state in local storage
  url: string;
  text: React.ReactNode | string;
  className?: string;
  icon?: React.ReactNode;
  isHidden?: boolean;
  isActive?: boolean;
  subMenus?: TabLayoutRoute[];
  onToggle?(id: string, meta: { props: SidebarItemProps, event: React.MouseEvent }): void;
}

@observer
export class SidebarItem extends React.Component<SidebarItemProps> {
  static displayName = "SidebarItem";

  get id(): string {
    return this.props.id; // unique id, used in storage and integration tests
  }

  get expanded(): boolean {
    return Boolean(sidebarLocalStorage.get().expanded[this.id]);
  }

  get compact(): boolean {
    return Boolean(sidebarLocalStorage.get().compact);
  }

  toggleExpand = (event: React.MouseEvent) => {
    sidebarLocalStorage.merge(draft => {
      draft.expanded[this.id] = !draft.expanded[this.id];
    });

    this.props.onToggle?.(this.id, {
      props: this.props,
      event,
    });
  };

  render() {
    const { isHidden, isActive, subMenus = [], icon, text, children, url, className } = this.props;

    if (isHidden) return null;

    const { id, expanded, compact } = this;
    const isExpandable = (subMenus.length > 0 || children) && !compact;
    const classNames = cssNames(SidebarItem.displayName, className, { compact });

    return (
      <div className={classNames} data-test-id={id}>
        <div className={cssNames("nav-item flex align-center", { active: isActive })}>
          <NavLink to={url} isActive={() => isActive}>
            {icon} <span className="link-text">{text}</span>
          </NavLink>
          {isExpandable && (
            <Icon
              className="expand-icon box right"
              material={expanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}
              onClick={prevDefault(this.toggleExpand)}
            />
          )}
        </div>
        {isExpandable && (
          <ul className={cssNames("sub-menu", { active: isActive })}>
            {subMenus.map(({ title, url }) => (
              <NavLink key={url} to={url} className={cssNames({ visible: expanded })}>
                {title}
              </NavLink>
            ))}
            {React.Children.toArray(children).map((child: React.ReactElement<any>) => {
              return React.cloneElement(child, {
                className: cssNames(child.props.className, { visible: expanded }),
              });
            })}
          </ul>
        )}
      </div>
    );
  }
}
