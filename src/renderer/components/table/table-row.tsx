/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./table-row.scss";

import React, { CSSProperties } from "react";
import { cssNames } from "../../utils";

export type TableRowElem<T> = React.ReactElement<TableRowProps<T>>;

export interface TableRowProps<T> extends React.DOMAttributes<HTMLDivElement> {
  className?: string;
  selected?: boolean;
  style?: CSSProperties;
  nowrap?: boolean; // white-space: nowrap, align inner <TableCell> in one line
  sortItem?: T; // data for sorting callback in <Table sortable={}/>
  searchItem?: T; // data for searching filters in <Table searchable={}/>
  disabled?: boolean;
}

export class TableRow<T> extends React.Component<TableRowProps<T>> {
  render() {
    const { className, nowrap, selected, disabled, children, sortItem, searchItem, ...rowProps } = this.props;
    const classNames = cssNames("TableRow", className, { selected, nowrap, disabled });

    return (
      <div className={classNames} {...rowProps}>
        {children}
      </div>
    );
  }
}
