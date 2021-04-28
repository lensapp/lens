import React from "react";
import { useTable, useBlockLayout, useResizeColumns, Column, HeaderGroup, UseResizeColumnsColumnProps } from "react-table";

export interface TableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
}

export function ReactiveTable<T extends object>({ columns, data }: TableProps<T>) {
  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30,
      width: 150,
      maxWidth: 400,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
  } = useTable<T>(
    {
      columns,
      data,
      defaultColumn,
    },
    useBlockLayout,
    useResizeColumns
  );

  return (
    <>
      <div>
        <div {...getTableProps()} className="table">
          <div>
            {headerGroups.map(headerGroup => {
              const { key, ...headerProps } = headerGroup.getHeaderGroupProps();

              return (
                <div key={key} {...headerProps} className="tr">
                  {headerGroup.headers.map(c => {
                    const column = c as HeaderGroup<T> & UseResizeColumnsColumnProps<T>; // needed until react table v8 is done
                    const { key, ...columnProps } = column.getHeaderProps();

                    return (
                      <div key={key} {...columnProps} className="th">
                        {column.render("Header")}
                        <div
                          {...column.getResizerProps()}
                          className={`resizer ${column.isResizing ? "isResizing" : ""}`}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              const { key, ...rowProps } = row.getRowProps();

              return (
                <div key={key} {...rowProps} className="tr">
                  {row.cells.map(cell => {
                    const { key, ...cellProps } = cell.getCellProps();

                    return (
                      <div key={key} {...cellProps} className="td">
                        {cell.render("Cell")}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <pre>
        <code>{JSON.stringify(state, null, 2)}</code>
      </pre>
    </>
  );
}
