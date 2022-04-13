/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./react-table.module.scss";
import React, { useCallback, useMemo } from "react";
import type { Row, UseTableOptions } from "react-table";
import { useFlexLayout, useSortBy, useTable } from "react-table";
import { Icon } from "../icon";
import { cssNames } from "../../utils";

export interface ReactTableProps extends UseTableOptions<any> {
  headless?: boolean;
}

export function ReactTable({ columns, data, headless }: ReactTableProps) {
  const defaultColumn = useMemo(
    () => ({
      minWidth: 20,
      width: 100,
    }),
    [],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    useFlexLayout,
    useSortBy,
  );

  const renderRow = useCallback(
    (row: Row<object>) => {
      prepareRow(row);

      return (
        <div className={styles.tr}>
          {row.cells.map((cell, index) => (
            <div
              {...cell.getCellProps()}
              key={cell.getCellProps().key}
              className={cssNames(styles.td, columns[index].accessor)}
            >
              {cell.render("Cell")}
            </div>
          ))}
        </div>
      );
    },
    [columns, prepareRow],
  );

  return (
    <div {...getTableProps()} className={styles.table}>
      {!headless && (
        <div className={styles.thead}>
          {headerGroups.map(headerGroup => (
            <div
              {...headerGroup.getHeaderGroupProps()}
              key={headerGroup.getHeaderGroupProps().key}
              className={styles.tr}
            >
              {headerGroup.headers.map(column => (
                <div
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  key={column.getHeaderProps().key}
                  className={styles.th}
                >
                  {column.render("Header")}
                  {/* Sort direction indicator */}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? <Icon material="arrow_drop_down" small/>
                        : <Icon material="arrow_drop_up" small/>
                      : !column.disableSortBy && (
                        <Icon
                          material="arrow_drop_down"
                          small
                          className={styles.disabledArrow}
                        />
                      )}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div {...getTableBodyProps()}>
        {rows.map(renderRow)}
      </div>
    </div>
  );
}
