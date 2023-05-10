/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./sub-header.scss";
import React from "react";
import type { StrictReactNode } from "@k8slens/utilities";
import { cssNames } from "@k8slens/utilities";

export interface SubHeaderProps {
  className?: string;
  withLine?: boolean; // add bottom line
  compact?: boolean; // no extra padding around content
  children: StrictReactNode;
}

export class SubHeader extends React.Component<SubHeaderProps> {
  render() {
    const { withLine, compact, children } = this.props;
    let { className } = this.props;

    className = cssNames("SubHeader", {
      withLine,
      compact,
    }, className);

    return (
      <div className={className}>
        {children}
      </div>
    );
  }
}
