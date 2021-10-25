/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { DrawerTitle, DrawerSubTitle } from "./drawer-title";

export interface DrawerSectionProps {
  className?: string;
  title?: React.ReactNode;
  hidden?: boolean;
}

export class DrawerSection extends React.Component<DrawerSectionProps> {
  render() {
    const { title, children, className, hidden } = this.props;

    if (hidden) {
      return null;
    }

    return (
      <>
        <DrawerTitle className={className} title={title} />
        {children}
      </>
    );
  }
}

export class DrawerSubSection extends React.Component<DrawerSectionProps> {
  render() {
    const { title, children, className, hidden } = this.props;

    if (hidden) {
      return null;
    }

    return (
      <>
        <DrawerSubTitle className={className} title={title} />
        {children}
      </>
    );
  }
}
