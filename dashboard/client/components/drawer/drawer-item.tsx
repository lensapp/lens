import "./drawer-item.scss";
import * as React from "react";
import { cssNames } from "../../utils";

export interface DrawerItemProps extends React.HTMLAttributes<any> {
  name: React.ReactNode;
  className?: string;
  title?: string;
  labelsOnly?: boolean;
  hidden?: boolean;
}

export class DrawerItem extends React.Component<DrawerItemProps> {
  render() {
    const { name, title, labelsOnly, children, hidden, ...elemProps } = this.props
    let { className } = this.props;
    if (hidden) return null
    className = cssNames("DrawerItem", className, { labelsOnly });
    return (
      <div {...elemProps} className={className} title={title}>
        <span className="name">{name}</span>
        <span className="value">{children}</span>
      </div>
    )
  }
}
