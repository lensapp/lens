import "./item-list-layout.scss";
import groupBy from "lodash/groupBy";

import React, { ReactNode } from "react";
import { computed, observable, reaction, toJS } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { ConfirmDialog, ConfirmDialogParams } from "../confirm-dialog";
import { Table, TableCell, TableCellProps, TableHead, TableProps, TableRow, TableRowProps, TableSortCallback } from "../table";
import { autobind, createStorage, cssNames, IClassName, isReactNode, noop, prevDefault, stopPropagation } from "../../utils";
import { AddRemoveButtons, AddRemoveButtonsProps } from "../add-remove-buttons";
import { NoItems } from "../no-items";
import { Spinner } from "../spinner";
import { ItemObject, ItemStore } from "../../item.store";
import { SearchInputUrl } from "../input";
import { Filter, FilterType, pageFilters } from "./page-filters.store";
import { PageFiltersList } from "./page-filters-list";
import { PageFiltersSelect } from "./page-filters-select";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";
import { themeStore } from "../../theme.store";
import { MenuActions } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Checkbox } from "../checkbox";
import { userStore } from "../../../common/user-store";
import { namespaceStore } from "../+namespaces/namespace.store";

// todo: refactor, split to small re-usable components

export type SearchFilter<T extends ItemObject = any> = (item: T) => string | number | (string | number)[];
export type ItemsFilter<T extends ItemObject = any> = (items: T[]) => T[];

interface IHeaderPlaceholders {
  title: ReactNode;
  search: ReactNode;
  filters: ReactNode;
  info: ReactNode;
}

export interface ItemListLayoutProps<T extends ItemObject = ItemObject> {
  tableId?: string;
  className: IClassName;
  items?: T[];
  store: ItemStore<T>;
  dependentStores?: ItemStore[];
  preloadStores?: boolean;
  isClusterScoped?: boolean;
  hideFilters?: boolean;
  searchFilters?: SearchFilter<T>[];
  filterItems?: ItemsFilter<T>[];

  // header (title, filtering, searching, etc.)
  showHeader?: boolean;
  headerClassName?: IClassName;
  renderHeaderTitle?: ReactNode | ((parent: ItemListLayout) => ReactNode);
  customizeHeader?: (placeholders: IHeaderPlaceholders, content: ReactNode) => Partial<IHeaderPlaceholders> | ReactNode;

  // items list configuration
  isReady?: boolean; // show loading indicator while not ready
  isSelectable?: boolean; // show checkbox in rows for selecting items
  isSearchable?: boolean; // apply search-filter & add search-input
  isConfigurable?: boolean;
  copyClassNameFromHeadCells?: boolean;
  sortingCallbacks?: { [sortBy: string]: TableSortCallback };
  tableProps?: Partial<TableProps>; // low-level table configuration
  renderTableHeader: TableCellProps[] | null;
  renderTableContents: (item: T) => (ReactNode | TableCellProps)[];
  renderItemMenu?: (item: T, store: ItemStore<T>) => ReactNode;
  customizeTableRowProps?: (item: T) => Partial<TableRowProps>;
  addRemoveButtons?: Partial<AddRemoveButtonsProps>;
  virtual?: boolean;

  // item details view
  hasDetailsView?: boolean;
  detailsItem?: T;
  onDetails?: (item: T) => void;

  // other
  customizeRemoveDialog?: (selectedItems: T[]) => Partial<ConfirmDialogParams>;
  renderFooter?: (parent: ItemListLayout) => React.ReactNode;
}

const defaultProps: Partial<ItemListLayoutProps> = {
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
  virtual: true
};

interface ItemListLayoutUserSettings {
  showAppliedFilters?: boolean;
}

@observer
export class ItemListLayout extends React.Component<ItemListLayoutProps> {
  static defaultProps = defaultProps as object;

  @observable userSettings: ItemListLayoutUserSettings = {
    showAppliedFilters: false,
  };

  constructor(props: ItemListLayoutProps) {
    super(props);

    // keep ui user settings in local storage
    const defaultUserSettings = toJS(this.userSettings);
    const storage = createStorage<ItemListLayoutUserSettings>("items_list_layout", defaultUserSettings);

    Object.assign(this.userSettings, storage.get()); // restore
    disposeOnUnmount(this, [
      reaction(() => toJS(this.userSettings), settings => storage.set(settings)),
    ]);
  }

  async componentDidMount() {
    const { isClusterScoped, isConfigurable, tableId, preloadStores } = this.props;

    if (isConfigurable && !tableId) {
      throw new Error("[ItemListLayout]: configurable list require props.tableId to be specified");
    }

    if (preloadStores) {
      this.loadStores();

      if (!isClusterScoped) {
        disposeOnUnmount(this, [
          namespaceStore.onContextChange(() => this.loadStores())
        ]);
      }
    }
  }

  private loadStores() {
    const { store, dependentStores } = this.props;
    const stores = Array.from(new Set([store, ...dependentStores]));

    // load context namespaces by default (see also: `<NamespaceSelectFilter/>`)
    stores.forEach(store => store.loadAll(namespaceStore.contextNamespaces));
  }

  private filterCallbacks: { [type: string]: ItemsFilter } = {
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

    [FilterType.NAMESPACE]: items => {
      const filterValues = pageFilters.getValues(FilterType.NAMESPACE);

      if (filterValues.length > 0) {
        return items.filter(item => filterValues.includes(item.getNs()));
      }

      return items;
    },
  };

  @computed get isReady() {
    return this.props.isReady ?? this.props.store.isLoaded;
  }

  @computed get filters() {
    let { activeFilters } = pageFilters;
    const { isSearchable, searchFilters } = this.props;

    if (!(isSearchable && searchFilters)) {
      activeFilters = activeFilters.filter(({ type }) => type !== FilterType.SEARCH);
    }

    return activeFilters;
  }

  applyFilters<T>(filters: ItemsFilter[], items: T[]): T[] {
    if (!filters || !filters.length) return items;

    return filters.reduce((items, filter) => filter(items), items);
  }

  @computed get allItems() {
    const { filterItems, store } = this.props;

    return this.applyFilters(filterItems, store.items);
  }

  @computed get items() {
    const { allItems, filters, filterCallbacks } = this;
    const filterItems: ItemsFilter[] = [];
    const filterGroups = groupBy<Filter>(filters, ({ type }) => type);

    Object.entries(filterGroups).forEach(([type, filtersGroup]) => {
      const filterCallback = filterCallbacks[type];

      if (filterCallback && filtersGroup.length > 0) {
        filterItems.push(filterCallback);
      }
    });

    const items = this.props.items ?? allItems;

    return this.applyFilters(filterItems, items);
  }

  @autobind()
  getRow(uid: string) {
    const {
      isSelectable, renderTableHeader, renderTableContents, renderItemMenu,
      store, hasDetailsView, onDetails,
      copyClassNameFromHeadCells, customizeTableRowProps, detailsItem,
    } = this.props;
    const { isSelected } = store;
    const item = this.items.find(item => item.getId() == uid);

    if (!item) return;
    const itemId = item.getId();

    return (
      <TableRow
        key={itemId}
        nowrap
        searchItem={item}
        sortItem={item}
        selected={detailsItem && detailsItem.getId() === itemId}
        onClick={hasDetailsView ? prevDefault(() => onDetails(item)) : undefined}
        {...(customizeTableRowProps ? customizeTableRowProps(item) : {})}
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

            if (!headCell || !this.isHiddenColumn(headCell)) {
              return <TableCell key={index} {...cellProps} />;
            }
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

  @autobind()
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

  renderFilters() {
    const { hideFilters } = this.props;
    const { isReady, userSettings, filters } = this;

    if (!isReady || !filters.length || hideFilters || !userSettings.showAppliedFilters) {
      return;
    }

    return <PageFiltersList filters={filters}/>;
  }

  renderNoItems() {
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

    return <NoItems/>;
  }

  renderHeaderContent(placeholders: IHeaderPlaceholders): ReactNode {
    const { title, filters, search, info } = placeholders;

    return (
      <>
        {title}
        <div className="info-panel box grow">
          {this.isReady && info}
        </div>
        {filters}
        {search}
      </>
    );
  }

  renderInfo() {
    const { items, isReady, userSettings, filters } = this;
    const allItemsCount = this.props.store.getTotalCount();
    const itemsCount = items.length;
    const isFiltered = isReady && filters.length > 0;

    if (isFiltered) {
      const toggleFilters = () => userSettings.showAppliedFilters = !userSettings.showAppliedFilters;

      return (
        <><a onClick={toggleFilters}>Filtered</a>: {itemsCount} / {allItemsCount}</>
      );
    }

    return allItemsCount <= 1 ? `${allItemsCount} item` : `${allItemsCount} items`;
  }

  renderHeader() {
    const { showHeader, customizeHeader, renderHeaderTitle, headerClassName, isClusterScoped } = this.props;

    if (!showHeader) return;
    const title = typeof renderHeaderTitle === "function" ? renderHeaderTitle(this) : renderHeaderTitle;
    const placeholders: IHeaderPlaceholders = {
      title: <h5 className="title">{title}</h5>,
      info: this.renderInfo(),
      filters: <>
        {!isClusterScoped && <NamespaceSelectFilter/>}
        <PageFiltersSelect allowEmpty disableFilters={{
          [FilterType.NAMESPACE]: true, // namespace-select used instead
        }}/>
      </>,
      search: <SearchInputUrl/>,
    };
    let header = this.renderHeaderContent(placeholders);

    if (customizeHeader) {
      const modifiedHeader = customizeHeader(placeholders, header);

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
    const { renderTableHeader, isSelectable, isConfigurable, store } = this.props;

    if (!renderTableHeader) {
      return;
    }

    return (
      <TableHead showTopLine nowrap>
        {isSelectable && (
          <TableCell
            checkbox
            isChecked={store.isSelectedAll(this.items)}
            onClick={prevDefault(() => store.toggleSelectionAll(this.items))}
          />
        )}
        {renderTableHeader.map((cellProps, index) => {
          if (!this.isHiddenColumn(cellProps)) {
            return <TableCell key={cellProps.id ?? index} {...cellProps} />;
          }
        })}
        <TableCell className="menu">
          {isConfigurable && this.renderColumnVisibilityMenu()}
        </TableCell>
      </TableHead>
    );
  }

  renderList() {
    const {
      store, hasDetailsView, addRemoveButtons = {}, virtual, sortingCallbacks, detailsItem,
      tableProps = {},
    } = this.props;
    const { isReady, removeItemsDialog, items } = this;
    const { selectedItems } = store;
    const selectedItemId = detailsItem && detailsItem.getId();

    return (
      <div className="items box grow flex column">
        {!isReady && (
          <Spinner center/>
        )}
        {isReady && (
          <Table
            virtual={virtual}
            selectable={hasDetailsView}
            sortable={sortingCallbacks}
            getTableRow={this.getRow}
            items={items}
            selectedItemId={selectedItemId}
            noItems={this.renderNoItems()}
            {...({
              ...tableProps,
              className: cssNames("box grow", tableProps.className, themeStore.activeTheme.type),
            })}
          >
            {this.renderTableHeader()}
            {
              !virtual && items.map(item => this.getRow(item.getId()))
            }
          </Table>

        )}
        <AddRemoveButtons
          onRemove={selectedItems.length ? removeItemsDialog : null}
          removeTooltip={`Remove selected items (${selectedItems.length})`}
          {...addRemoveButtons}
        />
      </div>
    );
  }

  @computed get hiddenColumns() {
    return userStore.getHiddenTableColumns(this.props.tableId);
  }

  isHiddenColumn({ id: columnId, showWithColumn }: TableCellProps): boolean {
    if (!this.props.isConfigurable) {
      return false;
    }

    return this.hiddenColumns.has(columnId) || (
      showWithColumn && this.hiddenColumns.has(showWithColumn)
    );
  }

  updateColumnVisibility({ id: columnId }: TableCellProps, isVisible: boolean) {
    const hiddenColumns = new Set(this.hiddenColumns);

    if (!isVisible) {
      hiddenColumns.add(columnId);
    } else {
      hiddenColumns.delete(columnId);
    }

    userStore.setHiddenTableColumns(this.props.tableId, hiddenColumns);
  }

  renderColumnVisibilityMenu() {
    const { renderTableHeader } = this.props;

    return (
      <MenuActions className="ItemListLayoutVisibilityMenu" toolbar={false} autoCloseOnSelect={false}>
        {renderTableHeader.map((cellProps, index) => (
          !cellProps.showWithColumn && (
            <MenuItem key={index} className="input">
              <Checkbox
                label={cellProps.title ?? `<${cellProps.className}>`}
                value={!this.isHiddenColumn(cellProps)}
                onChange={isVisible => this.updateColumnVisibility(cellProps, isVisible)}
              />
            </MenuItem>
          )
        ))}
      </MenuActions>
    );
  }

  renderFooter() {
    if (this.props.renderFooter) {
      return this.props.renderFooter(this);
    }
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
