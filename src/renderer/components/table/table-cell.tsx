/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./table-cell.scss";
import type { TableSortBy, TableSortParams } from "./table";

import React, { ReactNode } from "react";
import { boundMethod, cssNames, displayBooleans } from "../../utils";
import { Icon } from "../icon";
import { Checkbox } from "../checkbox";

export type TableCellElem = React.ReactElement<TableCellProps>;

export interface TableCellProps extends React.DOMAttributes<HTMLDivElement> {
  id?: string; // used for configuration visibility of columns
  className?: string;
  title?: ReactNode;
  checkbox?: boolean; // render cell with a checkbox
  isChecked?: boolean; // mark checkbox as checked or not
  renderBoolean?: boolean; // show "true" or "false" for all of the children elements are "typeof boolean"
  sortBy?: TableSortBy; // column name, must be same as key in sortable object <Table sortable={}/>
  showWithColumn?: string // id of the column which follow same visibility rules
  _sorting?: Partial<TableSortParams>; // <Table> sorting state, don't use this prop outside (!)
  _sort?(sortBy: TableSortBy): void; // <Table> sort function, don't use this prop outside (!)
  _nowrap?: boolean; // indicator, might come from parent <TableHead>, don't use this prop outside (!)
}

export class TableCell extends React.Component<TableCellProps> {
  @boundMethod
  onClick(evt: React.MouseEvent<HTMLDivElement>) {
    if (this.props.onClick) {
      this.props.onClick(evt);
    }

    if (this.isSortable) {
      this.props._sort(this.props.sortBy);
    }
  }

  get isSortable() {
    const { _sorting, sortBy } = this.props;

    return _sorting && sortBy !== undefined;
  }

  renderSortIcon() {
    const { sortBy, _sorting } = this.props;

    if (!this.isSortable) return null;
    const sortActive = _sorting.sortBy === sortBy;
    const sortIconName = (!sortActive || _sorting.orderBy === "desc") ? "arrow_drop_down" : "arrow_drop_up";

    return (
      <Icon
        className={cssNames("sortIcon", { enabled: sortActive })}
        material={sortIconName}
      />
    );
  }

  renderCheckbox() {
    const { checkbox, isChecked } = this.props;
    const showCheckbox = isChecked !== undefined;

    if (checkbox && showCheckbox) {
      return <Checkbox value={isChecked} />;
    }

    return null;
  }

  render() {
    const { className, checkbox, isChecked, sortBy, _sort, _sorting, _nowrap, children, title, renderBoolean: displayBoolean, showWithColumn, ...cellProps } = this.props;
    const classNames = cssNames("TableCell", className, {
      checkbox,
      nowrap: _nowrap,
      sorting: this.isSortable,
    });
    const content = displayBooleans(displayBoolean, title || children);

    return (
      <div {...cellProps} className={classNames} onClick={this.onClick}>
        {this.renderCheckbox()}
        {_nowrap ? <div className="content">{content}</div> : content}
        {this.renderSortIcon()}
      </div>
    );
  }
}
