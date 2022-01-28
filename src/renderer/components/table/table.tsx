/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./table.scss";

import React from "react";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { TableRow, TableRowElem, TableRowProps } from "./table-row";
import { TableHead, TableHeadElem, TableHeadProps } from "./table-head";
import type { TableCellElem } from "./table-cell";
import { VirtualList } from "../virtual-list";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { PageParam } from "../../navigation";
import getTableSortParamsInjectable from "./get-sort-params.injectable";
import setTableSortParamsInjectable from "./set-sort-params.injectable";
import orderByUrlParamInjectable from "./order-by-param.injectable";
import sortByUrlParamInjectable from "./sort-by-param.injectable";
import { getSorted } from "./sorting";

export type TableSortBy = string;
export type TableOrderBy = "asc" | "desc";
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

  /**
   * Use virtual list component to render only visible rows. By default uses a
   * auto sizer to fill available height
   */
  virtual?: boolean;
  /**
   * Only used when virtual is true. Sets the virtual list to be a fixed height.
   * Needed when used in contexts that already have a parent component that
   * is `overflow-y: scroll`,
   */
  virtualHeight?: number;
  /**
   * Row padding in pixels
   */
  rowPadding?: number;
  /**
   * Row line height in pixels
   */
  rowLineHeight?: number;
  customRowHeights?: (item: Item, lineHeight: number, paddings: number) => number;
  getTableRow?: (uid: string) => React.ReactElement<TableRowProps<Item>>;
  renderRow?: (item: Item) => React.ReactElement<TableRowProps<Item>>;
  "data-testid"?: string;
}

interface Dependencies {
  getSortParams: (tableId: string) => Partial<TableSortParams>;
  setSortParams: (tableId: string, data: Partial<TableSortParams>) => void;
  sortByUrlParam: PageParam<string>;
  orderByUrlParam: PageParam<string>;
}

const NonInjectedTable = observer(({ getSortParams, setSortParams, sortByUrlParam, orderByUrlParam, ...props }: Dependencies & TableProps<any>) => {
  const {
    scrollable = true,
    autoSize = true,
    rowPadding = 8,
    rowLineHeight = 17,
    sortSyncWithUrl = true,
    customRowHeights = (item, lineHeight, paddings) => lineHeight + paddings,
    sortable,
    tableId,
    sortByDefault,
    children,
    onSort,
    items,
    renderRow,
    noItems,
    virtual,
    getTableRow,
    selectedItemId,
    className,
    virtualHeight,
    selectable,
    "data-testid": dataTestId,
  } = props;
  const isSortable = Boolean(sortable && tableId);
  const sortParams = {
    ...sortByDefault,
    ...getSortParams(tableId),
  };

  const renderHead = () => {
    const content = React.Children.toArray(children) as (TableRowElem<any> | TableHeadElem)[];
    const headElem: React.ReactElement<TableHeadProps> = content.find(elem => elem.type === TableHead);

    if (!headElem) {
      return null;
    }

    if (isSortable) {
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
            _sort: sort,
            _sorting: sortParams,
            _nowrap: headElem.props.nowrap,
          });
        }),
      });
    }

    return headElem;
  };

  const onSortWrapped = ({ sortBy, orderBy }: TableSortParams) => {
    setSortParams(tableId, { sortBy, orderBy });

    if (sortSyncWithUrl) {
      sortByUrlParam.set(sortBy);
      orderByUrlParam.set(orderBy);
    }

    onSort?.({ sortBy, orderBy });
  };

  const sort = (colName: TableSortBy) => {
    const { sortBy, orderBy } = sortParams;
    const sameColumn = sortBy == colName;
    const newSortBy: TableSortBy = colName;
    const newOrderBy: TableOrderBy = (!orderBy || !sameColumn || orderBy === "desc") ? "asc" : "desc";

    onSortWrapped({
      sortBy: String(newSortBy),
      orderBy: newOrderBy,
    });
  };

  const getContent = () => {
    const content = React.Children.toArray(children) as (TableRowElem<any> | TableHeadElem)[];

    if (renderRow) {
      content.push(...items.map(renderRow));
    }

    return content;
  };

  const renderRows = () => {
    const content = getContent();
    let rows: React.ReactElement<TableRowProps<any>>[] = content.filter(elem => elem.type === TableRow);
    let sortedItems = rows.length ? rows.map(row => row.props.sortItem) : [...items];

    if (isSortable) {
      const { sortBy, orderBy } = sortParams;

      sortedItems = getSorted(sortedItems, sortable[sortBy], orderBy);

      if (rows.length) {
        rows = sortedItems.map(item => rows.find(row => item == row.props.sortItem));
      }
    }

    if (!rows.length && !items.length && noItems) {
      return noItems;
    }

    if (virtual) {
      const rowHeights = sortedItems.map(item => customRowHeights(item, rowLineHeight, rowPadding * 2));

      return (
        <VirtualList
          items={sortedItems}
          rowHeights={rowHeights}
          getRow={getTableRow}
          selectedItemId={selectedItemId}
          className={className}
          fixedHeight={virtualHeight}
        />
      );
    }

    return rows;
  };

  return (
    <div
      className={cssNames("Table flex column", className, {
        selectable, scrollable, sortable: isSortable, autoSize, virtual,
      })}
      data-testid={dataTestId}
    >
      {renderHead()}
      {renderRows()}
    </div>
  );
});

const InjectedTable = withInjectables<Dependencies, TableProps<any>>(NonInjectedTable, {
  getProps: (di, props) => ({
    getSortParams: di.inject(getTableSortParamsInjectable),
    setSortParams: di.inject(setTableSortParamsInjectable),
    sortByUrlParam: di.inject(sortByUrlParamInjectable),
    orderByUrlParam: di.inject(orderByUrlParamInjectable),
    ...props,
  }),
});

export function Table<Item>(props: TableProps<Item>) {
  return <InjectedTable {...props} />;
}
