import "./drawer-item.scss";
import React from "react";
import { cssNames, displayBooleans } from "../../utils";

export interface DrawerItemProps extends React.HTMLAttributes<any> {
  name: React.ReactNode;
  className?: string;
  title?: string;
  labelsOnly?: boolean;
  hidden?: boolean;
  renderBoolean?: boolean; // show "true" or "false" for all of the children elements are "typeof boolean"
}

export class DrawerItem extends React.Component<DrawerItemProps> {
  render() {
    const { name, title, labelsOnly, children, hidden, className, renderBoolean, ...elemProps } = this.props
    if (hidden) return null

    const classNames = cssNames("DrawerItem", className, { labelsOnly });
    const content = displayBooleans(renderBoolean, children)

    return (
      <div {...elemProps} className={classNames} title={title}>
        <span className="name">{name}</span>
        <span className="value">{content}</span>
      </div>
    )
  }
}
