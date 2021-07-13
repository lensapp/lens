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

import "./item-list-layout.scss";
import groupBy from "lodash/groupBy";

import React, { ReactNode } from "react";
import { computed, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { ConfirmDialog, ConfirmDialogParams } from "../confirm-dialog";
import { Table, TableCell, TableCellProps, TableHead, TableProps, TableRow, TableRowProps, TableSortCallbacks } from "../table";
import { boundMethod, createStorage, cssNames, IClassName, isReactNode, noop, ObservableToggleSet, prevDefault, stopPropagation } from "../../utils";
import { AddRemoveButtons, AddRemoveButtonsProps } from "../add-remove-buttons";
import { NoItems } from "../no-items";
import { Spinner } from "../spinner";
import type { ItemObject, ItemStore } from "../../item.store";
import { SearchInputUrlProps, SearchInputUrl } from "../input";
import { Filter, FilterType, pageFilters } from "./page-filters.store";
import { PageFiltersList } from "./page-filters-list";
import { ThemeStore } from "../../theme.store";
import { MenuActions } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Checkbox } from "../checkbox";
import { UserStore } from "../../../common/user-store";
import { namespaceStore } from "../+namespaces/namespace.store";



export type SearchFilter<I extends ItemObject> = (item: I) => string | number | (string | number)[];
export type SearchFilters<I extends ItemObject> = Record<string, SearchFilter<I>>;
export type ItemsFilter<I extends ItemObject> = (items: I[]) => I[];
export type ItemsFilters<I extends ItemObject> = Record<string, ItemsFilter<I>>;

export interface HeaderPlaceholders {
  title?: ReactNode;
  searchProps?: SearchInputUrlProps;
  filters?: ReactNode;
  info?: ReactNode;
}

export type HeaderCustomizer = (placeholders: HeaderPlaceholders) => HeaderPlaceholders;
export interface ItemListLayoutProps<I extends ItemObject> {
  tableId?: string;
  className: IClassName;
  items?: I[];
  store: ItemStore<I>;
  dependentStores?: ItemStore<ItemObject>[];
  preloadStores?: boolean;
  hideFilters?: boolean;
  searchFilters?: SearchFilter<I>[];
  /** @deprecated */
  filterItems?: ItemsFilter<I>[];

  // header (title, filtering, searching, etc.)
  showHeader?: boolean;
  headerClassName?: IClassName;
  renderHeaderTitle?: ReactNode | ((parent: ItemListLayout<I>) => ReactNode);
  customizeHeader?: HeaderCustomizer | HeaderCustomizer[];

  // items list configuration
  isReady?: boolean; // show loading indicator while not ready
  isSelectable?: boolean; // show checkbox in rows for selecting items
  isConfigurable?: boolean;
  copyClassNameFromHeadCells?: boolean;
  sortingCallbacks?: TableSortCallbacks<I>;
  tableProps?: Partial<TableProps<I>>; // low-level table configuration
  renderTableHeader: TableCellProps[] | null;
  renderTableContents: (item: I) => (ReactNode | TableCellProps)[];
  renderItemMenu?: (item: I, store: ItemStore<I>) => ReactNode;
  customizeTableRowProps?: (item: I) => Partial<TableRowProps>;
  addRemoveButtons?: Partial<AddRemoveButtonsProps>;
  virtual?: boolean;

  // item details view
  hasDetailsView?: boolean;
  detailsItem?: I;
  onDetails?: (item: I) => void;

  // other
  customizeRemoveDialog?: (selectedItems: I[]) => Partial<ConfirmDialogParams>;
  renderFooter?: (parent: ItemListLayout<I>) => React.ReactNode;

  filterCallbacks?: ItemsFilters<I>;
}

const defaultProps: Partial<ItemListLayoutProps<ItemObject>> = {
  showHeader: true,
  isSelectable: true,
  isConfigurable: false,
  copyClassNameFromHeadCells: true,
  preloadStores: true,
  dependentStores: [],
  searchFilters: [],
  customizeHeader: [],
  filterItems: [],
  hasDetailsView: true,
  onDetails: noop,
  virtual: true,
  customizeTableRowProps: () => ({} as TableRowProps),
};

@observer
export class ItemListLayout<I extends ItemObject> extends React.Component<ItemListLayoutProps<I>> {
  static defaultProps = defaultProps as object;

  private storage = createStorage("item_list_layout", {
    showFilters: false, // setup defaults
  });

  constructor(props: ItemListLayoutProps<I>) {
    super(props);
    makeObservable(this);
  }

  get showFilters(): boolean {
    return this.storage.get().showFilters;
  }

  set showFilters(showFilters: boolean) {
    this.storage.merge({ showFilters });
  }

  async componentDidMount() {
    const { isConfigurable, tableId, preloadStores } = this.props;

    if (isConfigurable && !tableId) {
      throw new Error("[ItemListLayout]: configurable list require props.tableId to be specified");
    }

    if (isConfigurable && !UserStore.getInstance().hiddenTableColumns.has(tableId)) {
      UserStore.getInstance().hiddenTableColumns.set(tableId, new ObservableToggleSet());
    }

    if (preloadStores) {
      this.loadStores();
    }
  }

  private loadStores() {
    const { store, dependentStores } = this.props;
    const stores = Array.from(new Set([store, ...dependentStores]));

    stores.forEach(store => store.loadAll(namespaceStore.contextNamespaces));
  }

  private filterCallbacks: ItemsFilters<I> = {
    [FilterType.SEARCH]: items => {
      const { searchFilters } = this.props;
      const search = pageFilters.getValues(FilterType.SEARCH)[0] || "";

      if (search && searchFilters.length) {
        const normalizeText = (text: string) => String(text).toLowerCase();
        const searchTexts = [search].map(normalizeText);

        return items.filter(item => {
          return searchFilters.some(getTexts => {
            const sourceTexts: string[] = [getTexts(item)].flat().map(normalizeText);

            return sourceTexts.some(source => searchTexts.some(search => source.includes(search)));
          });
        });
      }

      return items;
    },
  };

  @computed get isReady() {
    return this.props.isReady ?? this.props.store.isLoaded;
  }

  @computed get failedToLoad() {
    return this.props.store.failedLoading;
  }

  @computed get filters() {
    let { activeFilters } = pageFilters;
    const { searchFilters } = this.props;

    if (searchFilters.length === 0) {
      activeFilters = activeFilters.filter(({ type }) => type !== FilterType.SEARCH);
    }

    return activeFilters;
  }

  applyFilters(filters: ItemsFilter<I>[], items: I[]): I[] {
    if (!filters || !filters.length) return items;

    return filters.reduce((items, filter) => filter(items), items);
  }

  @computed get items() {
    const { filters, filterCallbacks, props } = this;
    const filterGroups = groupBy<Filter>(filters, ({ type }) => type);

    const filterItems: ItemsFilter<I>[] = [];

    Object.entries(filterGroups).forEach(([type, filtersGroup]) => {
      const filterCallback = filterCallbacks[type] ?? props.filterCallbacks?.[type];

      if (filterCallback && filtersGroup.length > 0) {
        filterItems.push(filterCallback);
      }
    });

    const items = this.props.items ?? this.props.store.items;

    return this.applyFilters(filterItems.concat(this.props.filterItems), items);
  }

  @boundMethod
  getRow(uid: string) {
    const {
      isSelectable, renderTableHeader, renderTableContents, renderItemMenu,
      store, hasDetailsView, onDetails,
      copyClassNameFromHeadCells, customizeTableRowProps, detailsItem,
    } = this.props;
    const { isSelected } = store;
    const item = this.items.find(item => item.getId() == uid);

    if (!item) return null;
    const itemId = item.getId();

    return (
      <TableRow
        key={itemId}
        nowrap
        searchItem={item}
        sortItem={item}
        selected={detailsItem && detailsItem.getId() === itemId}
        onClick={hasDetailsView ? prevDefault(() => onDetails(item)) : undefined}
        {...customizeTableRowProps(item)}
      >
        {isSelectable && (
          <TableCell
            checkbox
            isChecked={isSelected(item)}
            onClick={prevDefault(() => store.toggleSelection(item))}
          />
        )}
        {
          renderTableContents(item).map((content, index) => {
            const cellProps: TableCellProps = isReactNode(content) ? { children: content } : content;
            const headCell = renderTableHeader?.[index];

            if (copyClassNameFromHeadCells && headCell) {
              cellProps.className = cssNames(cellProps.className, headCell.className);
            }

            if (!headCell || this.showColumn(headCell)) {
              return <TableCell key={index} {...cellProps} />;
            }

            return null;
          })
        }
        {renderItemMenu && (
          <TableCell className="menu" onClick={stopPropagation}>
            {renderItemMenu(item, store)}
          </TableCell>
        )}
      </TableRow>
    );
  }

  @boundMethod
  removeItemsDialog() {
    const { customizeRemoveDialog, store } = this.props;
    const { selectedItems, removeSelectedItems } = store;
    const visibleMaxNamesCount = 5;
    const selectedNames = selectedItems.map(ns => ns.getName()).slice(0, visibleMaxNamesCount).join(", ");
    const dialogCustomProps = customizeRemoveDialog ? customizeRemoveDialog(selectedItems) : {};
    const selectedCount = selectedItems.length;
    const tailCount = selectedCount > visibleMaxNamesCount ? selectedCount - visibleMaxNamesCount : 0;
    const tail = tailCount > 0 ? <>, and <b>{tailCount}</b> more</> : null;
    const message = selectedCount <= 1 ? <p>Remove item <b>{selectedNames}</b>?</p> : <p>Remove <b>{selectedCount}</b> items <b>{selectedNames}</b>{tail}?</p>;

    ConfirmDialog.open({
      ok: removeSelectedItems,
      labelOk: "Remove",
      message,
      ...dialogCustomProps,
    });
  }

  @boundMethod
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  renderFilters() {
    const { hideFilters } = this.props;
    const { isReady, filters } = this;

    if (!isReady || !filters.length || hideFilters || !this.showFilters) {
      return null;
    }

    return <PageFiltersList filters={filters} />;
  }

  renderNoItems() {
    if (this.failedToLoad) {
      return <NoItems>Failed to load items.</NoItems>;
    }

    if (!this.isReady) {
      return <Spinner center />;
    }

    if (this.filters.length > 0) {
      return (
        <NoItems>
          No items found.
          <p>
            <a onClick={() => pageFilters.reset()} className="contrast">
              Reset filters?
            </a>
          </p>
        </NoItems>
      );
    }

    return <NoItems />;
  }

  renderItems() {
    if (this.props.virtual) {
      return null;
    }

    return this.items.map(item => this.getRow(item.getId()));
  }

  renderHeaderContent(placeholders: HeaderPlaceholders): ReactNode {
    const { searchFilters } = this.props;
    const { title, filters, searchProps, info } = placeholders;

    return (
      <>
        {title}
        {
          info && (
            <div className="info-panel box grow">
              {info}
            </div>
          )
        }
        {filters}
        {searchFilters.length > 0 && searchProps && <SearchInputUrl {...searchProps} />}
      </>
    );
  }

  renderInfo() {
    const { items, filters } = this;
    const allItemsCount = this.props.store.getTotalCount();
    const itemsCount = items.length;

    if (filters.length > 0) {
      return (
        <><a onClick={this.toggleFilters}>Filtered</a>: {itemsCount} / {allItemsCount}</>
      );
    }

    return allItemsCount === 1 ? `${allItemsCount} item` : `${allItemsCount} items`;
  }

  renderHeader() {
    const { showHeader, customizeHeader, renderHeaderTitle, headerClassName } = this.props;

    if (!showHeader) {
      return null;
    }

    const title = typeof renderHeaderTitle === "function" ? renderHeaderTitle(this) : renderHeaderTitle;
    const customizeHeaders = [customizeHeader].flat().filter(Boolean);
    const initialPlaceholders: HeaderPlaceholders = {
      title: <h5 className="title">{title}</h5>,
      info: this.renderInfo(),
      searchProps: {},
    };
    const headerPlaceholders = customizeHeaders.reduce((prevPlaceholders, customizer) => customizer(prevPlaceholders), initialPlaceholders);
    const header = this.renderHeaderContent(headerPlaceholders);

    return (
      <div className={cssNames("header flex gaps align-center", headerClassName)}>
        {header}
      </div>
    );
  }

  renderTableHeader() {
    const { customizeTableRowProps, renderTableHeader, isSelectable, isConfigurable, store } = this.props;

    if (!renderTableHeader) {
      return null;
    }

    const enabledItems = this.items.filter(item => !customizeTableRowProps(item).disabled);

    return (
      <TableHead showTopLine nowrap>
        {isSelectable && (
          <TableCell
            checkbox
            isChecked={store.isSelectedAll(enabledItems)}
            onClick={prevDefault(() => store.toggleSelectionAll(enabledItems))}
          />
        )}
        {renderTableHeader.map((cellProps, index) => (
          this.showColumn(cellProps) && (
            <TableCell key={cellProps.id ?? index} {...cellProps} />
          )
        ))}
        <TableCell className="menu">
          {isConfigurable && this.renderColumnVisibilityMenu()}
        </TableCell>
      </TableHead>
    );
  }

  renderList() {
    const {
      store, hasDetailsView, addRemoveButtons = {}, virtual, sortingCallbacks,
      detailsItem, className, tableProps = {}, tableId,
    } = this.props;
    const { removeItemsDialog, items } = this;
    const { selectedItems } = store;
    const selectedItemId = detailsItem && detailsItem.getId();
    const classNames = cssNames(className, "box", "grow", ThemeStore.getInstance().activeTheme.type);

    return (
      <div className="items box grow flex column">
        <Table
          tableId={tableId}
          virtual={virtual}
          selectable={hasDetailsView}
          sortable={sortingCallbacks}
          getTableRow={this.getRow}
          items={items}
          selectedItemId={selectedItemId}
          noItems={this.renderNoItems()}
          className={classNames}
          {...tableProps}
        >
          {this.renderTableHeader()}
          {this.renderItems()}
        </Table>
        <AddRemoveButtons
          onRemove={selectedItems.length ? removeItemsDialog : null}
          removeTooltip={`Remove selected items (${selectedItems.length})`}
          {...addRemoveButtons}
        />
      </div>
    );
  }

  showColumn({ id: columnId, showWithColumn }: TableCellProps): boolean {
    const { tableId, isConfigurable } = this.props;

    return !isConfigurable || !UserStore.getInstance().isTableColumnHidden(tableId, columnId, showWithColumn);
  }

  renderColumnVisibilityMenu() {
    const { renderTableHeader, tableId } = this.props;

    return (
      <MenuActions className="ItemListLayoutVisibilityMenu" toolbar={false} autoCloseOnSelect={false}>
        {renderTableHeader.map((cellProps, index) => (
          !cellProps.showWithColumn && (
            <MenuItem key={index} className="input">
              <Checkbox
                label={cellProps.title ?? `<${cellProps.className}>`}
                value={this.showColumn(cellProps)}
                onChange={() => UserStore.getInstance().toggleTableColumnVisibility(tableId, cellProps.id)}
              />
            </MenuItem>
          )
        ))}
      </MenuActions>
    );
  }

  renderFooter() {
    return this.props.renderFooter?.(this);
  }

  render() {
    const { className } = this.props;

    return (
      <div className={cssNames("ItemListLayout flex column", className)}>
        {this.renderHeader()}
        {this.renderFilters()}
        {this.renderList()}
        {this.renderFooter()}
      </div>
    );
  }
}
