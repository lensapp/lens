import styles from "./table-header.module.scss";
import React from "react";
import type { Table } from "@tanstack/react-table";
import { flexRender } from '@tanstack/react-table';
import { cssNames } from "../../utils";

interface TableHeaderProps<Data> {
  table: Table<Data>;
}

export function TableHeader<Data>({ table }: TableHeaderProps<Data>) {
  return (
    <thead>
      {table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map(header => (
            <th key={header.id} style={{ position: 'relative', width: header.getSize() }}>
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
