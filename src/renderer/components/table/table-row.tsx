/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./table-row.scss";

import type { CSSProperties } from "react";
import React from "react";
import { cssNames } from "../../utils";

export type TableRowElem<Item> = React.ReactElement<TableRowProps<Item>>;

export interface TableRowProps<Item> extends React.DOMAttributes<HTMLDivElement> {
  className?: string;
  selected?: boolean;
  style?: CSSProperties;
  nowrap?: boolean; // white-space: nowrap, align inner <TableCell> in one line
  sortItem?: Item; // data for sorting callback in <Table sortable={}/>
  searchItem?: Item; // data for searching filters in <Table searchable={}/>
  disabled?: boolean;
}

export class TableRow<Item> extends React.Component<TableRowProps<Item>> {
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
