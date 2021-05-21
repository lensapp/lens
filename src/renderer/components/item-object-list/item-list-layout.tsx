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
import { SearchInputUrl } from "../input";
import { Filter, FilterType, pageFilters } from "./page-filters.store";
import { PageFiltersList } from "./page-filters-list";
import { ThemeStore } from "../../theme.store";
import { MenuActions } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Checkbox } from "../checkbox";
import { UserStore } from "../../../common/user-store";
import { namespaceStore } from "../+namespaces/namespace.store";
import { KubeObjectStore } from "../../kube-object.store";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";

// todo: refactor, split to small re-usable components

export type SearchFilter<Item extends ItemObject> = (item: Item) => string | number | (string | number)[];
export type SearchFilters<Item extends ItemObject> = Record<string, SearchFilter<Item>>;
export type ItemsFilter<Item extends ItemObject> = (items: Item[]) => Item[];
export type ItemsFilters<Item extends ItemObject> = Record<string, ItemsFilter<Item>>;

export interface IHeaderPlaceholders {
  title: ReactNode;
  search: ReactNode;
  filters: ReactNode;
  info: ReactNode;
}

export interface ItemListLayoutProps<Item extends ItemObject> {
  tableId?: string;
  className: IClassName;
  items?: Item[];
  store: ItemStore<Item>;
  dependentStores?: ItemStore<ItemObject>[];
  preloadStores?: boolean;
  hideFilters?: boolean;
  searchFilters?: SearchFilter<Item>[];
  /** @deprecated */
  filterItems?: ItemsFilter<Item>[];

  // header (title, filtering, searching, etc.)
  showHeader?: boolean;
  headerClassName?: IClassName;
  renderHeaderTitle?: ReactNode | ((parent: ItemListLayout<Item>) => ReactNode);
  customizeHeader?: (placeholders: IHeaderPlaceholders, content: ReactNode) => Partial<IHeaderPlaceholders> | ReactNode;

  // items list configuration
  isReady?: boolean; // show loading indicator while not ready
  isSelectable?: boolean; // show checkbox in rows for selecting items
  isSearchable?: boolean; // apply search-filter & add search-input
  isConfigurable?: boolean;
  copyClassNameFromHeadCells?: boolean;
  sortingCallbacks?: TableSortCallbacks<Item>;
  tableProps?: Partial<TableProps<Item>>; // low-level table configuration
  renderTableHeader: TableCellProps[] | null;
  renderTableContents: (item: Item) => (ReactNode | TableCellProps)[];
  renderItemMenu?: (item: Item, store: ItemStore<Item>) => ReactNode;
  customizeTableRowProps?: (item: Item) => Partial<TableRowProps>;
  addRemoveButtons?: Partial<AddRemoveButtonsProps>;
  virtual?: boolean;

  // item details view
  hasDetailsView?: boolean;
  detailsItem?: Item;
  onDetails?: (item: Item) => void;

  // other
  customizeRemoveDialog?: (selectedItems: Item[]) => Partial<ConfirmDialogParams>;
  renderFooter?: (parent: ItemListLayout<Item>) => React.ReactNode;

  filterCallbacks?: ItemsFilters<Item>;
}

const defaultProps: Partial<ItemListLayoutProps<ItemObject>> = {
  showHeader: true,
  isSearchable: true,
  isSelectable: true,
  isConfigurable: false,
  copyClassNameFromHeadCells: true,
  preloadStores: true,
  dependentStores: [],
  filterItems: [],
  hasDetailsView: true,
  onDetails: noop,
  virtual: true,
  customizeTableRowProps: () => ({} as TableRowProps),
};

@observer
export class ItemListLayout<Item extends ItemObject> extends React.Component<ItemListLayoutProps<Item>> {
  static defaultProps = defaultProps as object;

  private storage = createStorage("item_list_layout", {
    showFilters: false, // setup defaults
  });

  constructor(props: ItemListLayoutProps<Item>) {
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

  private filterCallbacks: ItemsFilters<Item> = {
    [FilterType.SEARCH]: items => {
      const { searchFilters, isSearchable } = this.props;
      const search = pageFilters.getValues(FilterType.SEARCH)[0] || "";

      if (search && isSearchable && searchFilters) {
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
    const { isSearchable, searchFilters } = this.props;

    if (!(isSearchable && searchFilters)) {
      activeFilters = activeFilters.filter(({ type }) => type !== FilterType.SEARCH);
    }

    return activeFilters;
  }

  applyFilters(filters: ItemsFilter<Item>[], items: Item[]): Item[] {
    if (!filters || !filters.length) return items;

    return filters.reduce((items, filter) => filter(items), items);
  }

  @computed get items() {
    const { filters, filterCallbacks, props } = this;
    const filterGroups = groupBy<Filter>(filters, ({ type }) => type);

    const filterItems: ItemsFilter<Item>[] = [];

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

  renderHeaderContent(placeholders: IHeaderPlaceholders): ReactNode {
    const { isSearchable, searchFilters } = this.props;
    const { title, filters, search, info } = placeholders;

    return (
      <>
        {title}
        <div className="info-panel box grow">
          {info}
        </div>
        {filters}
        {isSearchable && searchFilters && search}
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

    const showNamespaceSelectFilter = this.props.store instanceof KubeObjectStore && this.props.store.api.isNamespaced;
    const title = typeof renderHeaderTitle === "function" ? renderHeaderTitle(this) : renderHeaderTitle;
    const placeholders: IHeaderPlaceholders = {
      title: <h5 className="title">{title}</h5>,
      info: this.renderInfo(),
      filters: showNamespaceSelectFilter && <NamespaceSelectFilter />,
      search: <SearchInputUrl />,
    };
    let header = this.renderHeaderContent(placeholders);

    if (customizeHeader) {
      const modifiedHeader = customizeHeader(placeholders, header) ?? {};

      if (isReactNode(modifiedHeader)) {
        header = modifiedHeader;
      } else {
        header = this.renderHeaderContent({
          ...placeholders,
          ...modifiedHeader as IHeaderPlaceholders,
        });
      }
    }

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
