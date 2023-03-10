/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./table-head.scss";

import React from "react";
import { cssNames } from "@k8slens/utilities";

export type TableHeadElem = React.ReactElement<TableHeadProps>;

export interface TableHeadProps extends React.DOMAttributes<HTMLDivElement> {
  className?: string;
  showTopLine?: boolean; // show border line at the top
  sticky?: boolean; // keep header on top when scrolling
  nowrap?: boolean; // white-space: nowrap, align inner <TableCell> in one line
  flat?: boolean; // no header background
}

export class TableHead extends React.Component<TableHeadProps> {
  static defaultProps: TableHeadProps = {
    sticky: true,
  };

  render() {
    const { className, sticky, nowrap, showTopLine, flat, children, ...headProps } = this.props;
    const classNames = cssNames("TableHead", className, {
      sticky, nowrap,
      topLine: showTopLine,
      flat,
    });

    return (
      <div className={classNames} {...headProps}>
        {children}
      </div>
    );
  }
}
