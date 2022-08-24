import styles from "./table-header.module.scss";
import React, { CSSProperties } from "react";
import type { Table, Header } from "@tanstack/react-table";
import { flexRender } from '@tanstack/react-table';
import { cssNames } from "../../utils";

export interface TableHeaderProps<Data> {
  table: Table<Data>;
  getColumnSizeStyles: (table: Table<Data>, header: Header<Data, unknown>) => CSSProperties;
  className?: string;
}

export function TableHeader<Data>({ table, className, getColumnSizeStyles }: TableHeaderProps<Data>) {
  return (
    <thead className={className}>
      {table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map(header => (
            <th key={header.id} style={{ position: 'relative', ...getColumnSizeStyles(table, header) }}>
              {header.isPlaceholder ? null : (
                <div
                  {...{
                    className: header.column.getCanSort()
                      ? styles.sortableColumn
                      : '',
                    onClick: header.column.getToggleSortingHandler(),
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {{
                    asc: ' 🔼',
                    desc: ' 🔽',
                  }[header.column.getIsSorted() as string] ?? null}
                  {header.column.getCanResize() && (
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={cssNames(styles.resizer, { [styles.isResizing]: header.column.getIsResizing() })}
                    ></div>
                  )}
                </div>
              )}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  )
}
