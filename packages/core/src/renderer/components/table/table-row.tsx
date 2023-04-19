/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./table-row.scss";

import type { CSSProperties } from "react";
import React from "react";
import { cssNames } from "@k8slens/utilities";

export type TableRowElem<Item> = React.ReactElement<TableRowProps<Item>>;

export interface TableRowProps<Item> extends React.DOMAttributes<HTMLDivElement> {
  className?: string;
  selected?: boolean;
  style?: CSSProperties;
  /**
   * Should the inner `<TableCell>` be aligned to one line
   * `white-space: nowrap`
   */
  nowrap?: boolean;
  /**
   * data for sorting callback in `<Table sortable={}></Table>`
   */
  sortItem?: Item;
  /**
   * data for searching filters in `<Table searchable={}></Table>`
   */
  searchItem?: Item;
  disabled?: boolean;
  testId?: string;
}

export class TableRow<Item> extends React.Component<TableRowProps<Item>> {
  render() {
    const { className, nowrap, selected, disabled, children, sortItem, searchItem, testId, ...rowProps } = this.props;
    const classNames = cssNames("TableRow", className, { selected, nowrap, disabled });

    return (
      <div
        className={classNames}
        data-testid={testId}
        {...rowProps}>
        {children}
      </div>
    );
  }
}
