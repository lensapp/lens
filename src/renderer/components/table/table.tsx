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

import "./table.scss";

import React from "react";
import { orderBy } from "lodash";
import { observer } from "mobx-react";
import { boundMethod, cssNames, noop } from "../../utils";
import { TableRow, TableRowElem, TableRowProps } from "./table-row";
import { TableHead, TableHeadElem, TableHeadProps } from "./table-head";
import type { TableCellElem } from "./table-cell";
import { VirtualList } from "../virtual-list";
import { createPageParam } from "../../navigation";
import { getSortParams, setSortParams } from "./table.storage";
import { computed, makeObservable } from "mobx";

export type TableSortBy = string;
export type TableOrderBy = "asc" | "desc" | string;
export type TableSortParams = { sortBy: TableSortBy; orderBy: TableOrderBy };
export type TableSortCallback<Item> = (data: Item) => string | number | (string | number)[];
export type TableSortCallbacks<Item> = Record<string, TableSortCallback<Item>>;

export interface TableProps<Item> extends React.DOMAttributes<HTMLDivElement> {
  tableId?: string;
  items?: Item[];  // Raw items data
  className?: string;
  autoSize?: boolean;   // Setup auto-sizing for all columns (flex: 1 0)
  selectable?: boolean; // Highlight rows on hover
  scrollable?: boolean; // Use scrollbar if content is bigger than parent's height
  storageKey?: string;  // Keep some data in localStorage & restore on page reload, e.g sorting params
  /**
   * Define sortable callbacks for every column in <TableHead><TableCell sortBy="someCol"><TableHead>
   * @sortItem argument in the callback is an object, provided in <TableRow sortItem={someColDataItem}/>
   */
  sortable?: TableSortCallbacks<Item>;
  sortSyncWithUrl?: boolean; // sorting state is managed globally from url params
  sortByDefault?: Partial<TableSortParams>; // default sorting params
  onSort?: (params: TableSortParams) => void; // callback on sort change, default: global sync with url
  noItems?: React.ReactNode; // Show no items state table list is empty
  selectedItemId?: string;  // Allows to scroll list to selected item
  virtual?: boolean; // Use virtual list component to render only visible rows
  rowPadding?: string;
  rowLineHeight?: string;
  customRowHeights?: (item: Item, lineHeight: number, paddings: number) => number;
  getTableRow?: (uid: string) => React.ReactElement<TableRowProps>;
  renderRow?: (item: Item) => React.ReactElement<TableRowProps>;
}

export const sortByUrlParam = createPageParam({
  name: "sort",
});

export const orderByUrlParam = createPageParam({
  name: "order",
});

@observer
export class Table<Item> extends React.Component<TableProps<Item>> {
  static defaultProps: TableProps<any> = {
    scrollable: true,
    autoSize: true,
    rowPadding: "8px",
    rowLineHeight: "17px",
    sortSyncWithUrl: true,
  };

  constructor(props: TableProps<Item>) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    const { sortable, tableId } = this.props;

    if (sortable && !tableId) {
      console.error("[Table]: sorted table requires props.tableId to be specified");
    }
  }

  @computed get sortParams() {
    return Object.assign({}, this.props.sortByDefault, getSortParams(this.props.tableId));
  }

  renderHead() {
    const { sortable, children } = this.props;
    const content = React.Children.toArray(children) as (TableRowElem | TableHeadElem)[];
    const headElem: React.ReactElement<TableHeadProps> = content.find(elem => elem.type === TableHead);

    if (!headElem) {
      return null;
    }

    if (sortable) {
      const columns = React.Children.toArray(headElem.props.children) as TableCellElem[];

      return React.cloneElement(headElem, {
        children: columns.map(elem => {
          if (elem.props.checkbox) {
            return elem;
          }
          const title = elem.props.title || (
            // copy cell content to title if it's a string
            // usable if part of TableCell's content is hidden when there is not enough space
            typeof elem.props.children === "string" ? elem.props.children : undefined
          );

          return React.cloneElement(elem, {
            title,
            _sort: this.sort,
            _sorting: this.sortParams,
            _nowrap: headElem.props.nowrap,
          });
        })
      });
    }

    return headElem;
  }

  getSorted(items: any[]) {
    const { sortBy, orderBy: order } = this.sortParams;
    const sortingCallback = this.props.sortable[sortBy] || noop;

    return orderBy(items, sortingCallback, order as any);
  }

  @boundMethod
  protected onSort({ sortBy, orderBy }: TableSortParams) {
    setSortParams(this.props.tableId, { sortBy, orderBy });
    const { sortSyncWithUrl, onSort } = this.props;

    if (sortSyncWithUrl) {
      sortByUrlParam.set(sortBy);
      orderByUrlParam.set(orderBy);
    }

    if (onSort) {
      onSort({ sortBy, orderBy });
    }
  }

  @boundMethod
  sort(colName: TableSortBy) {
    const { sortBy, orderBy } = this.sortParams;
    const sameColumn = sortBy == colName;
    const newSortBy: TableSortBy = colName;
    const newOrderBy: TableOrderBy = (!orderBy || !sameColumn || orderBy === "desc") ? "asc" : "desc";

    this.onSort({
      sortBy: String(newSortBy),
      orderBy: newOrderBy,
    });
  }

  private getContent() {
    const { items, renderRow, children } = this.props;
    const content = React.Children.toArray(children) as (TableRowElem | TableHeadElem)[];

    if (renderRow) {
      content.push(...items.map(renderRow));
    }

    return content;
  }

  renderRows() {
    const { sortable, noItems, virtual, customRowHeights, rowLineHeight, rowPadding, items, getTableRow, selectedItemId, className } = this.props;
    const content = this.getContent();
    let rows: React.ReactElement<TableRowProps>[] = content.filter(elem => elem.type === TableRow);
    let sortedItems = rows.length ? rows.map(row => row.props.sortItem) : [...items];

    if (sortable) {
      sortedItems = this.getSorted(sortedItems);

      if (rows.length) {
        rows = sortedItems.map(item => rows.find(row => {
          return item == row.props.sortItem;
        }));
      }
    }

    if (!rows.length && !items.length && noItems) {
      return noItems;
    }

    if (virtual) {
      const lineHeight = parseFloat(rowLineHeight);
      const padding = parseFloat(rowPadding);
      let rowHeights: number[] = Array(items.length).fill(lineHeight + padding * 2);

      if (customRowHeights) {
        rowHeights = sortedItems.map(item => {
          return customRowHeights(item, lineHeight, padding * 2);
        });
      }

      return (
        <VirtualList
          items={sortedItems}
          rowHeights={rowHeights}
          getRow={getTableRow}
          selectedItemId={selectedItemId}
          className={className}
        />
      );
    }

    return rows;
  }

  render() {
    const { selectable, scrollable, sortable, autoSize, virtual } = this.props;
    let { className } = this.props;

    className = cssNames("Table flex column", className, {
      selectable, scrollable, sortable, autoSize, virtual,
    });

    return (
      <div className={className}>
        {this.renderHead()}
        {this.renderRows()}
      </div>
    );
  }
}
