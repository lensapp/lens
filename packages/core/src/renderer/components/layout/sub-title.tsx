/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./sub-title.scss";
import React from "react";
import type { SafeReactNode } from "@k8slens/utilities";
import { cssNames } from "@k8slens/utilities";

export interface SubTitleProps {
  className?: string;
  title: SafeReactNode;
  compact?: boolean; // no bottom padding
  id?: string;
  children?: SafeReactNode;
}

export class SubTitle extends React.Component<SubTitleProps> {
  render() {
    const { className, compact, title, children, id } = this.props;
    const classNames = cssNames("SubTitle", className, {
      compact,
    });

    return (
      <div className={classNames} id={id}>
        {title}
        {" "}
        {children}
      </div>
    );
  }
}
