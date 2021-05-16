import styles from "./react-table.module.css";
import React from "react";
import { useCallback, useMemo } from "react";
import { useFlexLayout, useSortBy, useTable, UseTableOptions } from "react-table";
import { FixedSizeList } from "react-window";
import { Icon } from "../icon";
import { cssNames } from "../../utils";

interface Props extends UseTableOptions<any> {
  virtual?: boolean;
  headless?: boolean;
}

export function Table({ columns, data, virtual, headless }: Props) {
  const defaultColumn = useMemo(
    () => ({
      minWidth: 20,
      width: 100,
    }),
    []
  );

  // const scrollBarSize = React.useMemo(() => scrollbarWidth(), [])
  const scrollBarSize = 10;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    totalColumnsWidth,
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
        {virtual ? (
          <FixedSizeList
            height={400}
            itemCount={rows.length}
            itemSize={35}
            width={totalColumnsWidth+scrollBarSize}
          >
            {RenderRow}
          </FixedSizeList>
        ) : rows.map((row, index) => RenderRow({index}))}
      </div>
    </div>
  );
}
