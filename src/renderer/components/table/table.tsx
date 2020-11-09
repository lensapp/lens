import "./table.scss";

import React from "react";
import { observer } from "mobx-react";
import { computed, observable } from "mobx";
import { autobind, cssNames, noop } from "../../utils";
import { TableRow, TableRowElem, TableRowProps } from "./table-row";
import { TableHead, TableHeadElem, TableHeadProps } from "./table-head";
import { TableCellElem } from "./table-cell";
import { VirtualList } from "../virtual-list";
import { navigation, setQueryParams } from "../../navigation";
import orderBy from "lodash/orderBy"
import { ItemObject } from "../../item.store";

// todo: refactor + decouple search from location

export type TableSortBy = string;
export type TableOrderBy = "asc" | "desc" | string;
export type TableSortParams = { sortBy: TableSortBy; orderBy: TableOrderBy }
export type TableSortCallback<D = any> = (data: D) => string | number | (string | number)[];

export interface TableProps extends React.DOMAttributes<HTMLDivElement> {
  items?: ItemObject[];  // Raw items data
  className?: string;
  autoSize?: boolean;   // Setup auto-sizing for all columns (flex: 1 0)
  selectable?: boolean; // Highlight rows on hover
  scrollable?: boolean; // Use scrollbar if content is bigger than parent's height
  storageKey?: string;  // Keep some data in localStorage & restore on page reload, e.g sorting params
  sortable?: {
    // Define sortable callbacks for every column in <TableHead><TableCell sortBy="someCol"><TableHead>
    // @sortItem argument in the callback is an object, provided in <TableRow sortItem={someColDataItem}/>
    [sortBy: string]: TableSortCallback;
  };
  sortSyncWithUrl?: boolean; // sorting state is managed globally from url params
  sortByDefault?: Partial<TableSortParams>; // default sorting params
  onSort?: (params: TableSortParams) => void; // callback on sort change, default: global sync with url
  noItems?: React.ReactNode; // Show no items state table list is empty
  selectedItemId?: string;  // Allows to scroll list to selected item
  virtual?: boolean; // Use virtual list component to render only visible rows
  rowPadding?: string;
  rowLineHeight?: string;
  customRowHeights?: (item: object, lineHeight: number, paddings: number) => number;
  getTableRow?: (uid: string) => React.ReactElement<TableRowProps>;
}

@observer
export class Table extends React.Component<TableProps> {
  static defaultProps: TableProps = {
    scrollable: true,
    autoSize: true,
    rowPadding: "8px",
    rowLineHeight: "17px",
    sortSyncWithUrl: true,
  }

  @observable sortParamsLocal = this.props.sortByDefault;

  @computed get sortParams(): Partial<TableSortParams> {
    if (this.props.sortSyncWithUrl) {
      const sortBy = navigation.searchParams.get("sortBy")
      const orderBy = navigation.searchParams.get("orderBy")
      return { sortBy, orderBy };
    }
    return this.sortParamsLocal || {};
  }

  renderHead() {
    const { sortable, children } = this.props;
    const content = React.Children.toArray(children) as (TableRowElem | TableHeadElem)[];
    const headElem: React.ReactElement<TableHeadProps> = content.find(elem => elem.type === TableHead);
    if (headElem) {
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
              title: title,
              _sort: this.sort,
              _sorting: this.sortParams,
              _nowrap: headElem.props.nowrap,
            })
          })
        });
      }
      return headElem;
    }
  }

  getSorted(items: any[]) {
    const { sortParams } = this;
    const sortingCallback = this.props.sortable[sortParams.sortBy] || noop;
    return orderBy(
      items,
      sortingCallback,
      sortParams.orderBy as any
    );
  }

  @autobind()
  protected onSort(params: TableSortParams) {
    const { sortSyncWithUrl, onSort } = this.props;
    if (sortSyncWithUrl) {
      setQueryParams(params)
    }
    else {
      this.sortParamsLocal = params;
    }
    if (onSort) {
      onSort(params)
    }
  }

  @autobind()
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

  renderRows() {
    const { sortable, noItems, children, virtual, customRowHeights, rowLineHeight, rowPadding, items, getTableRow, selectedItemId, className } = this.props;
    const content = React.Children.toArray(children) as (TableRowElem | TableHeadElem)[];
    let rows: React.ReactElement<TableRowProps>[] = content.filter(elem => elem.type === TableRow);
    let sortedItems = rows.length ? rows.map(row => row.props.sortItem) : [...items];
    if (sortable) {
      sortedItems = this.getSorted(sortedItems);
      if (rows.length) {
        rows = sortedItems.map(item => rows.find(row => {
          return item == row.props.sortItem
        }))
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
    )
  }
}
