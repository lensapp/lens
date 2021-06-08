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

import styles from "./react-table.module.css";
import React, { useCallback, useMemo } from "react";
import { useFlexLayout, useSortBy, useTable, UseTableOptions } from "react-table";
import { Icon } from "../icon";
import { cssNames } from "../../utils";

interface Props extends UseTableOptions<any> {
  headless?: boolean;
}

export function ReactTable({ columns, data, headless }: Props) {
  const defaultColumn = useMemo(
    () => ({
      minWidth: 20,
      width: 100,
    }),
    []
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

  const RenderRow = useCallback(
    ({ index, style }) => {
      const row = rows[index];

      prepareRow(row);

      return (
        <div
          {...row.getRowProps({
            style,
          })}
          className={styles.tr}
        >
          {row.cells.map((cell, index) => (
            <div {...cell.getCellProps()} key={cell.getCellProps().key} className={cssNames(styles.td, columns[index].accessor)}>
              {cell.render("Cell")}
            </div>
          ))}
        </div>
      );
    },
    [columns, prepareRow, rows]
  );

  return (
    <div {...getTableProps()} className={styles.table}>
      {!headless && <div className={styles.thead}>
        {headerGroups.map(headerGroup => (
          <div {...headerGroup.getHeaderGroupProps()} key={headerGroup.getHeaderGroupProps().key} className={styles.tr}>
            {headerGroup.headers.map(column => (
              <div {...column.getHeaderProps(column.getSortByToggleProps())} key={column.getHeaderProps().key} className={styles.th}>
                {column.render("Header")}
                {/* Sort direction indicator */}
                <span>
                  {column.isSorted
                    ? column.isSortedDesc
                      ? <Icon material="arrow_drop_down" small/>
                      : <Icon material="arrow_drop_up" small/>
                    : !column.disableSortBy && <Icon material="arrow_drop_down" small className={styles.disabledArrow}/>}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>}

      <div {...getTableBodyProps()}>
        {rows.map((row, index) => RenderRow({index}))}
      </div>
    </div>
  );
}
