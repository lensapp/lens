import "./table.scss";

import React from "react";
import { observer } from "mobx-react";
import { computed, observable } from "mobx";
import { autobind, cssNames, hasKey, noop } from "../../utils";
import { TableRow, TableRowElem, TableRowProps } from "./table-row";
import { TableHead, TableHeadElem, TableHeadProps } from "./table-head";
import { TableCellElem } from "./table-cell";
import { VirtualList } from "../virtual-list";
import { navigation, setQueryParams } from "../../navigation";
import orderBy from "lodash/orderBy";
import { ItemObject } from "../../item.store";

// todo: refactor + decouple search from location

export enum TableOrderBy {
  ASCENDING = "asc",
  DECENDING = "desc",
}
export type TableSortParams<SortingOption extends string> = { sortBy: SortingOption; orderBy: TableOrderBy };
export type TableSortCallback<D> = (data: D) => string | number | (string | number)[];

export interface TableProps<Entry extends ItemObject, SortingOption extends string> extends React.DOMAttributes<HTMLDivElement> {
  /**
   * Raw items data
   */
  items?: Entry[];

  /**
   * Optional className for the root element
   */
  className?: string;

  /**
   * Setup auto-sizing for all columns (flex: 1 0)
   */
  autoSize?: boolean;

  /**
   * Highlight rows on hover
   */
  selectable?: boolean;

  /**
   * Use scrollbar if content is bigger than parent's height
   */
  scrollable?: boolean

  /**
   * Keep some data in localStorage & restore on page reload, e.g sorting params
   */
  storageKey?: string;

  /**
   * Define sortable callbacks for every column in <TableHead><TableCell sortBy="someCol"><TableHead>
   * @sortItem argument in the callback is an object, provided in <TableRow sortItem={someColDataItem}/>
   */
  sortable?: Record<SortingOption, TableSortCallback<Entry>>;

  /**
   * sorting state is managed globally from url params
   */
  sortSyncWithUrl?: boolean;

  /**
   * default sorting params
   */
  sortByDefault?: Partial<TableSortParams<SortingOption>>;

  /**
   * callback on sort change, default: global sync with url
   */
  onSort?: (params: TableSortParams<SortingOption>) => void;

  /**
   * Show no items state table list is empty
   */
  noItems?: React.ReactNode;

  /**
   * Allows to scroll list to selected item
   */
  selectedItemId?: string;

  /**
   * Use virtual list component to render only visible rows
   */
  virtual?: boolean;

  /**
   * the number of pixels to render between subsequent rows
   */
  rowPadding?: string;

  /**
   * the number of pixels to render for a specific row
   */
  rowLineHeight?: string;

  /**
   * A function for generating a special number for a specific item
   */
  customRowHeights?: (item: any, lineHeight: number, paddings: number) => number;

  /**
   *
   */
  getTableRow?: (uid: string) => React.ReactElement<TableRowProps>;
}

function validateOrderBy(source: string | null, defaultDirection = TableOrderBy.DECENDING): TableOrderBy {
  const transformed = source?.toLowerCase();

  if (transformed === TableOrderBy.ASCENDING || transformed === TableOrderBy.DECENDING) {
    return transformed;
  }

  return defaultDirection;
}

const swapOrderBy: Record<TableOrderBy, TableOrderBy> = {
  [TableOrderBy.ASCENDING]: TableOrderBy.DECENDING,
  [TableOrderBy.DECENDING]: TableOrderBy.ASCENDING,
};

@observer
export class Table<Entry extends ItemObject = ItemObject, SortingOption extends string = string> extends React.Component<TableProps<Entry, SortingOption>> {
  static defaultProps: TableProps<ItemObject, string> = {
    scrollable: true,
    autoSize: true,
    rowPadding: "8px",
    rowLineHeight: "17px",
    sortSyncWithUrl: true,
  };

  @observable sortParamsLocal = this.props.sortByDefault;

  @computed get sortParams(): Partial<TableSortParams<SortingOption>> {
    const { sortSyncWithUrl, sortable } = this.props;

    if (sortSyncWithUrl) {
      const sortBy = navigation.searchParams.get("sortBy");
      const orderBy = validateOrderBy(navigation.searchParams.get("orderBy"));

      if (sortable && hasKey(sortable, sortBy)) {
        return { sortBy, orderBy };
      }
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
  }

  getSorted(items: any[]) {
    const { sortParams } = this;
    const sortingCallback = this.props.sortable[sortParams.sortBy] || noop;

    return orderBy(
      items,
      sortingCallback,
      sortParams.orderBy
    );
  }

  @autobind()
  protected onSort(params: TableSortParams<SortingOption>) {
    const { sortSyncWithUrl, onSort } = this.props;

    if (sortSyncWithUrl) {
      setQueryParams(params);
    } else {
      this.sortParamsLocal = params;
    }

    onSort?.(params);
  }

  @autobind()
  sort(colName: SortingOption) {
    const { sortBy, orderBy = TableOrderBy.ASCENDING } = this.sortParams;
    const newOrderBy = (sortBy === colName) ? swapOrderBy[orderBy] : TableOrderBy.DECENDING;

    this.onSort({
      sortBy: colName,
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
    const { selectable, scrollable, sortable, autoSize, virtual, className } = this.props;
    const classNames = cssNames("Table flex column", className, {
      selectable, scrollable, sortable, autoSize, virtual,
    });

    return (
      <div className={classNames}>
        {this.renderHead()}
        {this.renderRows()}
      </div>
    );
  }
}
