import "./drawer-title.scss";
import React from "react";
import { cssNames } from "../../utils";

export interface DrawerTitleProps {
  className?: string;
  title?: React.ReactNode;
}

export class DrawerTitle extends React.Component<DrawerTitleProps> {
  render() {
    const { title, children, className } = this.props
    return (
      <div className={cssNames("DrawerTitle", className)}>
        {title || children}
      </div>
    )
  }
}
