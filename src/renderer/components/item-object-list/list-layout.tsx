/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./item-list-layout.scss";

import type { ReactNode } from "react";
import React from "react";
import { computed, makeObservable, untracked } from "mobx";
import type { ConfirmDialogParams } from "../confirm-dialog";
import type { TableCellProps, TableProps, TableRowProps, TableSortCallbacks } from "../table";
import type { IClassName, SingleOrMany, StorageLayer } from "../../utils";
import { autoBind, cssNames, noop } from "../../utils";
import type { AddRemoveButtonsProps } from "../add-remove-buttons";
import type { ItemObject } from "../../../common/item.store";
import type { SearchInputUrlProps } from "../input";
import { FilterType, pageFilters } from "./page-filters.store";
import { PageFiltersList } from "./page-filters-list";
import type { NamespaceStore } from "../+namespaces/namespace-store/namespace.store";
import namespaceStoreInjectable from "../+namespaces/namespace-store/namespace-store.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import itemListLayoutStorageInjectable from "./storage.injectable";
import { ItemListLayoutContent } from "./content";
import { ItemListLayoutHeader } from "./header";
import groupBy from "lodash/groupBy";
import { ItemListLayoutFilters } from "./filters";
import { observer } from "mobx-react";
import type { Primitive } from "type-fest";
import type { SubscribableStore } from "../../kube-watch-api/kube-watch-api";

export type SearchFilter<I extends ItemObject> = (item: I) => SingleOrMany<string | number | undefined | null>;
export type SearchFilters<I extends ItemObject> = Record<string, SearchFilter<I>>;
export type ItemsFilter<I extends ItemObject> = (items: I[]) => I[];
export type ItemsFilters<I extends ItemObject> = Record<string, ItemsFilter<I>>;

export interface HeaderPlaceholders {
  title?: ReactNode;
  searchProps?: SearchInputUrlProps;
  filters?: ReactNode;
  info?: ReactNode;
}

function normalizeText(value: Primitive) {
  return String(value).toLowerCase();
}

export type ItemListStore<I extends ItemObject, PreLoadStores extends boolean> = {
  readonly isLoaded: boolean;
  readonly failedLoading: boolean;
  getTotalCount: () => number;
  isSelected: (item: I) => boolean;
  toggleSelection: (item: I) => void;
  isSelectedAll: (items: I[]) => boolean;
  toggleSelectionAll: (enabledItems: I[]) => void;
  pickOnlySelected: (items: I[]) => I[];
} & ({
  removeItems: (selectedItems: I[]) => Promise<void>;
  readonly selectedItems: I[];
  removeSelectedItems?: unknown;
} | {
  removeSelectedItems: () => Promise<void>;
  selectedItems?: unknown;
  removeItems?: unknown;
}) & (
  PreLoadStores extends true
    ? {
      loadAll: (selectedNamespaces: readonly string[]) => Promise<void>;
    }
    : {
      loadAll?: unknown;
    }
);

export type RenderHeaderTitle<
  Item extends ItemObject,
  PreLoadStores extends boolean,
> = ReactNode | ((parent: NonInjectedItemListLayout<Item, PreLoadStores>) => ReactNode);

export type HeaderCustomizer = (placeholders: HeaderPlaceholders) => HeaderPlaceholders;
export type ItemListLayoutProps<Item extends ItemObject, PreLoadStores extends boolean = boolean> = {
  tableId?: string;
  className: IClassName;
  getItems: () => Item[];
  store: ItemListStore<Item, PreLoadStores>;
  dependentStores?: SubscribableStore[];
  preloadStores?: boolean;
  hideFilters?: boolean;
  searchFilters?: SearchFilter<Item>[];
  /** @deprecated */
  filterItems?: ItemsFilter<Item>[];

  // header (title, filtering, searching, etc.)
  showHeader?: boolean;
  headerClassName?: IClassName;
  renderHeaderTitle?: RenderHeaderTitle<Item, PreLoadStores>;
  customizeHeader?: HeaderCustomizer | HeaderCustomizer[];

  // items list configuration
  isReady?: boolean; // show loading indicator while not ready
  isSelectable?: boolean; // show checkbox in rows for selecting items
  isConfigurable?: boolean;
  copyClassNameFromHeadCells?: boolean;
  sortingCallbacks?: TableSortCallbacks<Item>;
  tableProps?: Partial<TableProps<Item>>; // low-level table configuration
  renderTableHeader?: (TableCellProps | undefined | null)[];
  renderTableContents: (item: Item) => (ReactNode | TableCellProps)[];
  renderItemMenu?: (item: Item, store: ItemListStore<Item, PreLoadStores>) => ReactNode;
  customizeTableRowProps?: (item: Item) => Partial<TableRowProps<Item>>;
  addRemoveButtons?: Partial<AddRemoveButtonsProps>;
  virtual?: boolean;

  // item details view
  hasDetailsView?: boolean;
  detailsItem?: Item;
  onDetails?: (item: Item) => void;

  // other
  customizeRemoveDialog?: (selectedItems: Item[]) => Partial<ConfirmDialogParams>;
  renderFooter?: (parent: NonInjectedItemListLayout<Item, PreLoadStores>) => React.ReactNode;

  /**
   * Message to display when a store failed to load
   *
   * @default "Failed to load items"
   */
  failedToLoadMessage?: React.ReactNode;

  filterCallbacks?: ItemsFilters<Item>;
} & (
  PreLoadStores extends true
    ? {
      preloadStores?: true;
    }
    : {
      preloadStores: false;
    }
);

const defaultProps: Partial<ItemListLayoutProps<ItemObject, true>> = {
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
  customizeTableRowProps: () => ({}),
  failedToLoadMessage: "Failed to load items",
};

export interface ItemListLayoutStorage {
  showFilters: boolean;
}

interface Dependencies {
  namespaceStore: NamespaceStore;
  itemListLayoutStorage: StorageLayer<ItemListLayoutStorage>;
}

@observer
class NonInjectedItemListLayout<I extends ItemObject, PreLoadStores extends boolean> extends React.Component<ItemListLayoutProps<I, PreLoadStores> & Dependencies> {
  static defaultProps = defaultProps as object;

  constructor(props: ItemListLayoutProps<I, PreLoadStores> & Dependencies) {
    super(props);
    makeObservable(this);
    autoBind(this);
  }

  async componentDidMount() {
    const { isConfigurable, tableId, preloadStores } = this.props;

    if (isConfigurable && !tableId) {
      throw new Error("[ItemListLayout]: configurable list require props.tableId to be specified");
    }

    if (preloadStores) {
      const { store, dependentStores = [] } = this.props;
      const stores = Array.from(new Set([store, ...dependentStores])) as ItemListStore<I, true>[];

      stores.forEach(store => store.loadAll(this.props.namespaceStore.contextNamespaces));
    }
  }

  get showFilters(): boolean {
    return this.props.itemListLayoutStorage.get().showFilters;
  }

  set showFilters(showFilters: boolean) {
    this.props.itemListLayoutStorage.merge({ showFilters });
  }

  @computed get filters() {
    let { activeFilters } = pageFilters;
    const { searchFilters = [] } = this.props;

    if (searchFilters.length === 0) {
      activeFilters = activeFilters.filter(({ type }) => type !== FilterType.SEARCH);
    }

    return activeFilters;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  @computed get isReady() {
    return this.props.isReady ?? this.props.store.isLoaded;
  }

  renderFilters() {
    const { hideFilters } = this.props;
    const { isReady, filters } = this;

    if (!isReady || !filters.length || hideFilters || !this.showFilters) {
      return null;
    }

    return <PageFiltersList filters={filters} />;
  }

  private filterCallbacks: ItemsFilters<I> = {
    [FilterType.SEARCH]: items => {
      const { searchFilters = [] } = this.props;
      const search = pageFilters.getValues(FilterType.SEARCH)[0] || "";

      if (search && searchFilters.length) {
        const searchTexts = [search].map(normalizeText);

        return items.filter(item => (
          searchFilters.some(getTexts => (
            [getTexts(item)]
              .flat()
              .map(normalizeText)
              .some(source => searchTexts.some(search => source.includes(search)))
          ))
        ));
      }

      return items;
    },
  };

  @computed get items() {
    const filterGroups = groupBy(this.filters, ({ type }) => type);
    const filterItems: ItemsFilter<I>[] = [];

    for (const [type, filtersGroup] of Object.entries(filterGroups)) {
      const filterCallback = this.filterCallbacks[type] ?? this.props.filterCallbacks?.[type];

      if (filterCallback && filtersGroup.length > 0) {
        filterItems.push(filterCallback);
      }
    }

    const items = this.props.getItems();

    return applyFilters(filterItems.concat(this.props.filterItems ?? []), items);
  }

  render() {
    const { renderHeaderTitle } = this.props;

    return untracked(() => (
      <div
        className={cssNames("ItemListLayout flex column", this.props.className)}
      >
        <ItemListLayoutHeader
          getItems={() => this.items}
          getFilters={() => this.filters}
          toggleFilters={this.toggleFilters}
          store={this.props.store}
          searchFilters={this.props.searchFilters}
          showHeader={this.props.showHeader}
          headerClassName={this.props.headerClassName}
          renderHeaderTitle={(
            typeof renderHeaderTitle === "function"
              ? () => renderHeaderTitle(this)
              : renderHeaderTitle
          )}
          customizeHeader={this.props.customizeHeader}
        />

        <ItemListLayoutFilters
          getIsReady={() => this.isReady}
          getFilters={() => this.filters}
          getFiltersAreShown={() => this.showFilters}
          hideFilters={this.props.hideFilters ?? false}
        />

        <ItemListLayoutContent<I, PreLoadStores>
          getItems={() => this.items}
          getFilters={() => this.filters}
          tableId={this.props.tableId}
          className={this.props.className}
          store={this.props.store}
          getIsReady={() => this.isReady}
          isSelectable={this.props.isSelectable}
          isConfigurable={this.props.isConfigurable}
          copyClassNameFromHeadCells={this.props.copyClassNameFromHeadCells}
          sortingCallbacks={this.props.sortingCallbacks}
          tableProps={this.props.tableProps}
          renderTableHeader={this.props.renderTableHeader}
          renderTableContents={this.props.renderTableContents}
          renderItemMenu={this.props.renderItemMenu}
          customizeTableRowProps={this.props.customizeTableRowProps}
          addRemoveButtons={this.props.addRemoveButtons}
          virtual={this.props.virtual}
          hasDetailsView={this.props.hasDetailsView}
          detailsItem={this.props.detailsItem}
          onDetails={this.props.onDetails}
          customizeRemoveDialog={this.props.customizeRemoveDialog}
          failedToLoadMessage={this.props.failedToLoadMessage}
        />

        {this.props.renderFooter?.(this)}
      </div>
    ));
  }
}

const InjectedItemListLayout = withInjectables<Dependencies, ItemListLayoutProps<ItemObject, boolean>>(NonInjectedItemListLayout, {
  getProps: (di, props) => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    itemListLayoutStorage: di.inject(itemListLayoutStorageInjectable),
    ...props,
  }),
});

export function ItemListLayout<I extends ItemObject, PreLoadStores extends boolean = true>(props: ItemListLayoutProps<I, PreLoadStores>) {
  return <InjectedItemListLayout {...(props as never)} />;
}

function applyFilters<I extends ItemObject>(filters: ItemsFilter<I>[], items: I[]): I[] {
  if (!filters || !filters.length) {
    return items;
  }

  return filters.reduce((items, filter) => filter(items), items);
}
