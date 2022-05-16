/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./table.scss";

import React from "react";
import { observer } from "mobx-react";
import { autoBind, cssNames, isDefined } from "../../utils";
import type { TableRowElem, TableRowProps } from "./table-row";
import { TableRow } from "./table-row";
import type { TableHeadElem } from "./table-head";
import { TableHead } from "./table-head";
import type { TableCellElem } from "./table-cell";
import { VirtualList } from "../virtual-list";
import type { PageParam } from "../../navigation";
import { computed, makeObservable } from "mobx";
import { getSorted } from "./sorting";
import type { TableModel } from "./table-model/table-model";
import { withInjectables } from "@ogre-tools/injectable-react";
import tableModelInjectable from "./table-model/table-model.injectable";
import type { ItemObject } from "../../../common/item.store";
import assert from "assert";
import orderByUrlParamInjectable from "./order-by-url-param.injectable";
import sortByUrlParamInjectable from "./sort-by-url-param.injectable";

export type TableSortBy = string;
export type TableOrderBy = "asc" | "desc";
export interface TableSortParams {
  sortBy: TableSortBy;
  orderBy: TableOrderBy;
}
export type TableSortCallback<Item> = (data: Item) => undefined | string | number | (string | number)[];
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
  getTableRow?: (uid: string) => React.ReactElement<TableRowProps<Item>> | undefined | null;
  renderRow?: (item: Item) => React.ReactElement<TableRowProps<Item>> | undefined | null;
}

interface Dependencies {
  model: TableModel;
  sortByUrlParam: PageParam<string>;
  orderByUrlParam: PageParam<string>;
}

@observer
class NonInjectedTable<Item extends ItemObject> extends React.Component<TableProps<Item> & Dependencies> {
  static defaultProps: TableProps<any> = {
    scrollable: true,
    autoSize: true,
    rowPadding: 8,
    rowLineHeight: 17,
    sortSyncWithUrl: true,
    customRowHeights: (item, lineHeight, paddings) => lineHeight + paddings,
  };

  constructor(props: TableProps<Item> & Dependencies) {
    super(props);
    makeObservable(this);
    autoBind(this);
  }

  componentDidMount() {
    const { sortable, tableId } = this.props;

    if (sortable && !tableId) {
      console.error("Table must have props.tableId if props.sortable is specified");
    }
  }

  @computed get isSortable() {
    const { sortable, tableId } = this.props;

    return Boolean(sortable && tableId);
  }

  @computed get sortParams() {
    const modelParams = this.props.tableId
      ? this.props.model.getSortParams(this.props.tableId)
      : {};

    return Object.assign({}, this.props.sortByDefault, modelParams);
  }

  renderHead() {
    const { children } = this.props;
    const content = React.Children.toArray(children) as (TableRowElem<Item> | TableHeadElem)[];
    const headElem = content.find(elem => elem.type === TableHead);

    if (!headElem) {
      return null;
    }

    if (this.isSortable) {
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
        }),
      });
    }

    return headElem;
  }

  getSorted(rawItems: Item[]) {
    const { sortBy, orderBy } = this.sortParams;

    if (!sortBy || !orderBy) {
      return rawItems;
    }

    return getSorted(rawItems, this.props.sortable?.[sortBy], orderBy);
  }

  protected onSort({ sortBy, orderBy }: TableSortParams) {
    assert(this.props.tableId);
    this.props.model.setSortParams(this.props.tableId, { sortBy, orderBy });
    const { sortSyncWithUrl, onSort } = this.props;

    if (sortSyncWithUrl) {
      this.props.sortByUrlParam.set(sortBy);
      this.props.orderByUrlParam.set(orderBy);
    }

    onSort?.({ sortBy, orderBy });
  }

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
    const { items = [], renderRow, children } = this.props;
    const content = React.Children.toArray(children) as (TableRowElem<Item> | TableHeadElem)[];

    if (renderRow) {
      content.push(...items.map(renderRow).filter(isDefined));
    }

    return content;
  }

  renderRows() {
    const {
      noItems, virtual, customRowHeights, rowLineHeight, rowPadding, items = [],
      getTableRow, selectedItemId, className, virtualHeight,
    } = this.props;
    const content = this.getContent();
    let rows: React.ReactElement<TableRowProps<Item>>[] = content.filter(elem => elem.type === TableRow);
    let sortedItems = (
      rows.length
        ? rows.map(row => row.props.sortItem)
        : items
    ).filter(isDefined);

    if (this.isSortable) {
      sortedItems = this.getSorted(sortedItems);

      if (rows.length) {
        rows = sortedItems
          .map(item => rows.find(row => item == row.props.sortItem))
          .filter(isDefined);
      }
    }

    if (!rows.length && !items.length && noItems) {
      return noItems;
    }

    if (virtual) {
      assert(customRowHeights && rowLineHeight && rowPadding);
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
  }

  render() {
    const { selectable, scrollable, autoSize, virtual, className } = this.props;
    const classNames = cssNames("Table flex column", className, {
      selectable, scrollable, sortable: this.isSortable, autoSize, virtual,
    });

    return (
      <div className={classNames}>
        {this.renderHead()}
        {this.renderRows()}
      </div>
    );
  }
}

export const Table = withInjectables<Dependencies, TableProps<ItemObject>>(NonInjectedTable, {
  getProps: (di, props) => ({
    ...props,
    model: di.inject(tableModelInjectable),
    orderByUrlParam: di.inject(orderByUrlParamInjectable),
    sortByUrlParam: di.inject(sortByUrlParamInjectable),
  }),
}) as <Item>(props: TableProps<Item>) => React.ReactElement;

