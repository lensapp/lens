/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { MenuActions, MenuItem } from "../menu";
import React from "react";
import { action, computed } from "mobx";
import { isReactNode, stopPropagation } from "@k8slens/utilities";
import type { KubeObject } from "@k8slens/kube-object";
import { Checkbox } from "../checkbox";
import type { TableCellProps } from "@k8slens/list-layout";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { TableDataContextValue } from "./table-data-context";
import { CreateTableState, createTableStateInjectionToken } from "@k8slens/table";

type TableDataColumn<DataItem = any> = object;

export function createLensTableState<K extends KubeObject>({
  tableId,
  getFilters,
  renderItemMenu,
  store,
  onDetails,
  hasDetailsView,
  getItems,
  renderTableHeader,
  renderTableContents,
  sortingCallbacks,
  isSelectable,
  columns: contextColumns,
}: TableDataContextValue<K>, createState: CreateTableState) {
  const headers = renderTableHeader as Required<TableCellProps>[];


  let headingColumns: TableDataColumn<K>[] = headers.map(
    ({ id: columnId, className, title }, index) => ({
      id: columnId ?? className,
      className,
      resizable: !!columnId,
      sortable: !!columnId,
      draggable: !!columnId, // e.g. warning-icon column in pods
      title,
      renderValue(row: any, col: any) {
        const content =
          renderTableContents?.(row.data)[index] ??
          contextColumns
            ?.find((col) => col.id === columnId)
            ?.content?.(row.data);

        if (isReactNode(content)) {
          return content;
        } else {
          const { className, title } = content as TableCellProps;

          return <div className={className}>{title}</div>;
        }
      },
      sortValue(row: any, col: any) {
        return sortingCallbacks?.[col.id]?.(row.data) as string;
      },
    })
  );

  const checkboxColumn: TableDataColumn<K> = {
    id: "checkbox",
    className: "checkbox",
    draggable: false,
    sortable: false,
    resizable: false,
    get title() {
      return (
        <div onClick={stopPropagation}>
          <Checkbox
            value={tableState.isSelectedAll.get()}
            onChange={() => tableState.toggleRowSelectionAll()}
          />
        </div>
      );
    },
    renderValue({ id: rowId }: { id: string | number | symbol }) {
      return (
        <div onClick={stopPropagation}>
          <Checkbox
            value={tableState.selectedRowsId.has(rowId)}
            onChange={action((val, evt) => {
              if (tableState.selectedRowsId.has(rowId)) {
                tableState.selectedRowsId.delete(rowId);
              } else {
                tableState.selectedRowsId.add(rowId);
              }
            })}
          />
        </div>
      );
    },
  };

  const menuColumn: TableDataColumn<K> = {
    id: "menu",
    className: "menu",
    resizable: false,
    sortable: false,
    draggable: false,
    get title() {
      return (
        <MenuActions
          id={`menu-actions-for-item-object-list-content-${tableId}`}
          className="ItemListLayoutVisibilityMenu"
          toolbar={false}
          autoCloseOnSelect={false}
        >
          {headers
            .filter((headerCell) => !headerCell.showWithColumn)
            .map(({ id: columnId, title, className }) => (
              <MenuItem key={columnId} className="input">
                <Checkbox
                  label={title ?? className}
                  value={!tableState.hiddenColumns.has(columnId)}
                  onChange={action((value, evt) => {
                    if (tableState.hiddenColumns.has(columnId)) {
                      tableState.hiddenColumns.delete(columnId);
                    } else {
                      tableState.hiddenColumns.add(columnId);
                    }
                  })}
                />
              </MenuItem>
            ))}
        </MenuActions>
      );
    },
    renderValue(row: any, col: any) {
      return (
        <div onClick={stopPropagation}>{renderItemMenu?.(row.data, store)}</div>
      );
    },
  };

  if (isSelectable) {
    headingColumns = [checkboxColumn, ...headingColumns];
  }

  const tableState = createState({
    dataItems: computed(getItems),
    headingColumns: [...headingColumns, menuColumn],

    searchBox: computed(() => {
      return getFilters().find((item) => item.type === "search")?.value ?? "";
    }),

    customizeRows: () => ({
      className: `${hasDetailsView ? "withDetails" : ""}`,
      onSelect(row: any, evt: any) {
        if (evt.isPropagationStopped()) {
          return; // e.g. click on `checkbox` (== select row)
        }

        evt.stopPropagation();
        evt.preventDefault();
        onDetails?.(row.data);
      },
    }),
  });

  return tableState;
}

export const tableStateInjectable = getInjectable({
  id: "table-state",
  instantiate(di, context: TableDataContextValue<any>) {
    const createState = di.inject(createTableStateInjectionToken);

    return createLensTableState(context, createState);
  },
  lifecycle: lifecycleEnum.transient,
});