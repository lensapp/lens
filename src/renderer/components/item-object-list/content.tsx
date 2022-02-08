/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./item-list-layout.scss";

import React, { ReactNode } from "react";
import { computed, makeObservable } from "mobx";
import { Observer, observer } from "mobx-react";
import { ConfirmDialog, ConfirmDialogParams } from "../confirm-dialog";
import { Table, TableCell, TableCellProps, TableHead, TableProps, TableRow, TableRowProps, TableSortCallbacks } from "../table";
import { boundMethod, cssNames, IClassName, isReactNode, prevDefault, stopPropagation } from "../../utils";
import { AddRemoveButtons, AddRemoveButtonsProps } from "../add-remove-buttons";
import { NoItems } from "../no-items";
import { Spinner } from "../spinner";
import type { ItemObject, ItemStore } from "../../../common/item.store";
import { Filter, pageFilters } from "./page-filters.store";
import { ThemeStore } from "../../theme.store";
import { MenuActions } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Checkbox } from "../checkbox";
import { UserStore } from "../../../common/user-store";

interface ItemListLayoutContentProps<I extends ItemObject> {
  getFilters: () => Filter[]
  tableId?: string;
  className: IClassName;
  getItems: () => I[];
  store: ItemStore<I>;
  getIsReady: () => boolean; // show loading indicator while not ready
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

  /**
   * Message to display when a store failed to load
   *
   * @default "Failed to load items"
   */
  failedToLoadMessage?: React.ReactNode;
}

@observer
export class ItemListLayoutContent<I extends ItemObject> extends React.Component<ItemListLayoutContentProps<I>> {
  constructor(props: ItemListLayoutContentProps<I>) {
    super(props);
    makeObservable(this);
  }

  @computed get failedToLoad() {
    return this.props.store.failedLoading;
  }

  @boundMethod
  getRow(uid: string) {
    return (
      <div key={uid}>
        <Observer>
          {() => {
            const {
              isSelectable, renderTableHeader, renderTableContents, renderItemMenu,
              store, hasDetailsView, onDetails,
              copyClassNameFromHeadCells, customizeTableRowProps, detailsItem,
            } = this.props;
            const { isSelected } = store;
            const item = this.props.getItems().find(item => item.getId() == uid);

            if (!item) return null;
            const itemId = item.getId();

            return (
              <TableRow
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
          }}
        </Observer>
      </div>
    );
  }

  @boundMethod
  removeItemsDialog(selectedItems: I[]) {
    const { customizeRemoveDialog, store } = this.props;
    const visibleMaxNamesCount = 5;
    const selectedNames = selectedItems.map(ns => ns.getName()).slice(0, visibleMaxNamesCount).join(", ");
    const dialogCustomProps = customizeRemoveDialog ? customizeRemoveDialog(selectedItems) : {};
    const selectedCount = selectedItems.length;
    const tailCount = selectedCount > visibleMaxNamesCount
      ? selectedCount - visibleMaxNamesCount
      : 0;
    const tail = tailCount > 0
      ? <>, and <b>{tailCount}</b> more</>
      : null;
    const message = selectedCount <= 1
      ? <p>Remove item <b>{selectedNames}</b>?</p>
      : <p>Remove <b>{selectedCount}</b> items <b>{selectedNames}</b>{tail}?</p>;
    const onConfirm = store.removeItems
      ? () => store.removeItems(selectedItems)
      : store.removeSelectedItems;

    ConfirmDialog.open({
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
      return <Spinner center />;
    }

    if (this.props.getFilters().length > 0) {
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

    return this.props.getItems().map(item => this.getRow(item.getId()));
  }

  renderTableHeader() {
    const { customizeTableRowProps, renderTableHeader, isSelectable, isConfigurable, store } = this.props;

    if (!renderTableHeader) {
      return null;
    }

    const enabledItems = this.props.getItems().filter(item => !customizeTableRowProps(item).disabled);

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

  render() {
    const {
      store, hasDetailsView, addRemoveButtons = {}, virtual, sortingCallbacks,
      detailsItem, className, tableProps = {}, tableId, getItems,
    } = this.props;
    const selectedItemId = detailsItem && detailsItem.getId();
    const classNames = cssNames(className, "box", "grow", ThemeStore.getInstance().activeTheme.type);
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
                  : null
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
}
