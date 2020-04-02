import "./drawer-title.scss";
import * as React from "react";
import { cssNames } from "../../utils";

interface Props {
  className?: string;
  title?: React.ReactNode;
}

export class DrawerTitle extends React.Component<Props> {
  render() {
    const { title, children, className } = this.props
    return (
      <div className={cssNames("DrawerTitle", className)}>
        {title || children}
      </div>
    )
  }
}
