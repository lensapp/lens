/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./item-list-layout.scss";

import React from "react";
import type { IComputedValue } from "mobx";
import { computed, makeObservable } from "mobx";
import { Observer, observer } from "mobx-react";
import type { ConfirmDialogParams } from "../confirm-dialog";
import type { TableProps, TableRowProps, TableSortCallbacks } from "../table";
import { Table, TableCell, TableHead, TableRow } from "../table";
import type { IClassName, StrictReactNode } from "@k8slens/utilities";
import { cssNames, isDefined, isReactNode, noop, prevDefault, stopPropagation } from "@k8slens/utilities";
import type { AddRemoveButtonsProps } from "../add-remove-buttons";
import { AddRemoveButtons } from "../add-remove-buttons";
import { NoItems } from "../no-items";
import { Spinner } from "@k8slens/spinner";
import type { ItemObject, TableCellProps } from "@k8slens/list-layout";
import type { Filter, PageFiltersStore } from "./page-filters/store";
import type { LensTheme } from "../../themes/lens-theme";
import { MenuActions } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Checkbox } from "../checkbox";
import type { ItemListStore } from "./list-layout";
import { withInjectables } from "@ogre-tools/injectable-react";
import pageFiltersStoreInjectable from "./page-filters/store.injectable";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";
import activeThemeInjectable from "../../themes/active.injectable";
import autoBindReact from "auto-bind/react";
import type { ToggleTableColumnVisibility } from "../../../features/user-preferences/common/toggle-table-column-visibility.injectable";
import toggleTableColumnVisibilityInjectable from "../../../features/user-preferences/common/toggle-table-column-visibility.injectable";
import type { IsTableColumnHidden } from "../../../features/user-preferences/common/is-table-column-hidden.injectable";
import isTableColumnHiddenInjectable from "../../../features/user-preferences/common/is-table-column-hidden.injectable";

export interface ItemListLayoutContentProps<Item extends ItemObject, PreLoadStores extends boolean> {
  getFilters: () => Filter[];
  tableId?: string;
  className: IClassName;
  getItems: () => Item[];
  store: ItemListStore<Item, PreLoadStores>;
  getIsReady: () => boolean; // show loading indicator while not ready
  isSelectable?: boolean; // show checkbox in rows for selecting items
  isConfigurable?: boolean;
  copyClassNameFromHeadCells?: boolean;
  sortingCallbacks?: TableSortCallbacks<Item>;
  tableProps?: Partial<TableProps<Item>>; // low-level table configuration
  renderTableHeader?: (TableCellProps | undefined | null)[];
  renderTableContents: (item: Item) => (StrictReactNode | TableCellProps)[];
  renderItemMenu?: (item: Item, store: ItemListStore<Item, PreLoadStores>) => StrictReactNode;
  customizeTableRowProps?: (item: Item) => Partial<TableRowProps<Item>>;
  addRemoveButtons?: Partial<AddRemoveButtonsProps>;
  virtual?: boolean;

  // item details view
  hasDetailsView?: boolean;
  detailsItem?: Item;
  onDetails?: (item: Item) => void;

  // other
  customizeRemoveDialog?: (selectedItems: Item[]) => Partial<ConfirmDialogParams>;

  spinnerTestId?: string;

  /**
   * Message to display when a store failed to load
   *
   * @default "Failed to load items"
   */
  failedToLoadMessage?: StrictReactNode;
}

interface Dependencies {
  activeTheme: IComputedValue<LensTheme>;
  pageFiltersStore: PageFiltersStore;
  openConfirmDialog: OpenConfirmDialog;
  toggleTableColumnVisibility: ToggleTableColumnVisibility;
  isTableColumnHidden: IsTableColumnHidden;
}

@observer
class NonInjectedItemListLayoutContent<
  Item extends ItemObject,
  PreLoadStores extends boolean,
> extends React.Component<ItemListLayoutContentProps<Item, PreLoadStores> & Dependencies> {
  constructor(props: ItemListLayoutContentProps<Item, PreLoadStores> & Dependencies) {
    super(props);
    makeObservable(this);
    autoBindReact(this);
  }

  @computed get failedToLoad() {
    return this.props.store.failedLoading;
  }

  renderRow(item: Item) {
    return this.getTableRow(item);
  }

  getTableRow(item: Item) {
    const {
      isSelectable, renderTableHeader, renderTableContents, renderItemMenu,
      store, hasDetailsView, onDetails,
      copyClassNameFromHeadCells, customizeTableRowProps = () => ({}), detailsItem,
    } = this.props;
    const { isSelected } = store;

    return (
      <TableRow
        nowrap
        searchItem={item}
        sortItem={item}
        selected={detailsItem && detailsItem.getId() === item.getId()}
        onClick={hasDetailsView ? prevDefault(() => onDetails?.(item)) : undefined}
        {...customizeTableRowProps(item)}
      >
        {isSelectable && (
          <TableCell
            checkbox
            isChecked={isSelected(item)}
            onClick={prevDefault(() => store.toggleSelection(item))}
          />
        )}
        {renderTableContents(item).map((content, index) => {
          const cellProps: TableCellProps = isReactNode(content)
            ? { children: content }
            : content;
          const headCell = renderTableHeader?.[index];

          if (copyClassNameFromHeadCells && headCell) {
            cellProps.className = cssNames(
              cellProps.className,
              headCell.className,
            );
          }

          if (!headCell || this.showColumn(headCell)) {
            return <TableCell key={index} {...cellProps} />;
          }

          return null;
        })}
        {renderItemMenu && (
          <TableCell className="menu">
            <div onClick={stopPropagation}>
              {renderItemMenu(item, store)}
            </div>
          </TableCell>
        )}
      </TableRow>
    );
  }

  getRow(uid: string) {
    return (
      <div key={uid}>
        <Observer>
          {() => {
            const item = this.props.getItems().find(item => item.getId() === uid);

            if (!item) return null;

            return this.getTableRow(item);
          }}
        </Observer>
      </div>
    );
  }

  removeItemsDialog(selectedItems: Item[]) {
    const { customizeRemoveDialog, store, openConfirmDialog } = this.props;
    const visibleMaxNamesCount = 5;
    const selectedNames = selectedItems.map(ns => ns.getName()).slice(0, visibleMaxNamesCount).join(", ");
    const dialogCustomProps = customizeRemoveDialog ? customizeRemoveDialog(selectedItems) : {};
    const selectedCount = selectedItems.length;
    const tailCount = selectedCount > visibleMaxNamesCount
      ? selectedCount - visibleMaxNamesCount
      : 0;
    const tail = tailCount > 0
      ? (
        <>
          {", and "}
          <b>{tailCount}</b>
          {" more"}
        </>
      )
      : null;
    const message = selectedCount <= 1
      ? (
        <p>
          {"Remove item "}
          <b>{selectedNames}</b>
          ?
        </p>
      )
      : (
        <p>
          {"Remove "}
          <b>{selectedCount}</b>
          {" items "}
          <b>{selectedNames}</b>
          {tail}
          ?
        </p>
      );
    const { removeSelectedItems, removeItems } = store;
    const onConfirm = typeof removeItems === "function"
      ? () => removeItems.apply(store, [selectedItems])
      : typeof removeSelectedItems === "function"
        ? removeSelectedItems.bind(store)
        : noop;

    openConfirmDialog({
      ok: onConfirm,
      labelOk: "Remove",
      message,
      ...dialogCustomProps,
    });
  }

  renderNoItems() {
    if (this.failedToLoad) {
      return <NoItems>{this.props.failedToLoadMessage}</NoItems>;
    }

    if (!this.props.getIsReady()) {
      return <Spinner center data-testid={this.props.spinnerTestId} />;
    }

    if (this.props.getFilters().length > 0) {
      return (
        <NoItems>
          No items found.
          <p>
            <a onClick={() => this.props.pageFiltersStore.reset()} className="contrast">
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

    return this.props.getItems().map(item => this.getRow(item.getId()));
  }

  renderTableHeader() {
    const { customizeTableRowProps, renderTableHeader, isSelectable, isConfigurable, store, tableId } = this.props;

    if (!renderTableHeader) {
      return null;
    }

    const enabledItems = this.props.getItems().filter(item => !customizeTableRowProps?.(item).disabled);

    return (
      <TableHead showTopLine nowrap>
        {isSelectable && (
          <Observer>
            {() => (
              <TableCell
                checkbox
                isChecked={store.isSelectedAll(enabledItems)}
                onClick={prevDefault(() => store.toggleSelectionAll(enabledItems))}
              />
            )}
          </Observer>
        )}
        {
          renderTableHeader
            .filter(isDefined)
            .map((cellProps, index) => (
              this.showColumn(cellProps) && (
                <TableCell key={cellProps.id ?? index} {...cellProps} />
              )
            ))
        }
        <TableCell className="menu">
          {(isConfigurable && tableId)
            ? this.renderColumnVisibilityMenu(tableId)
            : undefined
          }
        </TableCell>
      </TableHead>
    );
  }

  render() {
    const {
      store, hasDetailsView, addRemoveButtons = {}, virtual, sortingCallbacks,
      detailsItem, className, tableProps = {}, tableId, getItems, activeTheme,
    } = this.props;
    const selectedItemId = detailsItem && detailsItem.getId();
    const classNames = cssNames(className, "box", "grow", activeTheme.get().type);
    const items = getItems();
    const selectedItems = store.pickOnlySelected(items);

    return (
      <div className="items box grow flex column">
        <Table
          tableId={tableId}
          virtual={virtual}
          selectable={hasDetailsView}
          sortable={sortingCallbacks}
          getTableRow={this.getRow}
          renderRow={virtual ? undefined : this.renderRow}
          items={items}
          selectedItemId={selectedItemId}
          noItems={this.renderNoItems()}
          className={classNames}
          {...tableProps}
        >
          {this.renderTableHeader()}
          {this.renderItems()}
        </Table>

        <Observer>
          {() => (
            <AddRemoveButtons
              onRemove={
                (store.removeItems || store.removeSelectedItems) && selectedItems.length > 0
                  ? () => this.removeItemsDialog(selectedItems)
                  : undefined
              }
              removeTooltip={`Remove selected items (${selectedItems.length})`}
              {...addRemoveButtons}
            />
          )}
        </Observer>
      </div>
    );
  }

  showColumn({ id: columnId, showWithColumn }: TableCellProps): boolean {
    const { tableId, isConfigurable } = this.props;

    return !isConfigurable || !tableId || !this.props.isTableColumnHidden(tableId, columnId, showWithColumn);
  }

  renderColumnVisibilityMenu(tableId: string) {
    const { renderTableHeader = [] } = this.props;

    return (
      <MenuActions
        id="menu-actions-for-item-object-list-content"
        className="ItemListLayoutVisibilityMenu"
        toolbar={false}
        autoCloseOnSelect={false}
      >
        {
          renderTableHeader
            .filter(isDefined)
            .filter((props): props is TableCellProps & { id: string } => !!props.id)
            .filter(props => !props.showWithColumn)
            .map((cellProps) => (
              <MenuItem key={cellProps.id} className="input">
                <Checkbox
                  label={cellProps.title ?? `<${cellProps.className}>`}
                  value={this.showColumn(cellProps)}
                  onChange={() => this.props.toggleTableColumnVisibility(tableId, cellProps.id)}
                />
              </MenuItem>
            ))
        }
      </MenuActions>
    );
  }
}

export const ItemListLayoutContent = withInjectables<Dependencies, ItemListLayoutContentProps<ItemObject, boolean>>(NonInjectedItemListLayoutContent, {
  getProps: (di, props) => ({
    ...props,
    activeTheme: di.inject(activeThemeInjectable),
    pageFiltersStore: di.inject(pageFiltersStoreInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    toggleTableColumnVisibility: di.inject(toggleTableColumnVisibilityInjectable),
    isTableColumnHidden: di.inject(isTableColumnHiddenInjectable),
  }),
}) as <Item extends ItemObject, PreLoadStores extends boolean>(props: ItemListLayoutContentProps<Item, PreLoadStores>) => React.ReactElement;
