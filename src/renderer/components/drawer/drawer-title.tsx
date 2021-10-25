/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./drawer-title.scss";
import React from "react";
import { cssNames } from "../../utils";

export interface DrawerTitleProps {
  className?: string;
  title?: React.ReactNode;
}

export class DrawerTitle extends React.Component<DrawerTitleProps> {
  render() {
    const { title, children, className } = this.props;

    return (
      <div className={cssNames("DrawerTitle", className)}>
        {title || children}
      </div>
    );
  }
}
export class DrawerSubTitle extends React.Component<DrawerTitleProps> {
  render() {
    const { title, children, className } = this.props;

    return (
      <div className={cssNames("DrawerSubTitle", className)}>
        {title || children}
      </div>
    );
  }
}
