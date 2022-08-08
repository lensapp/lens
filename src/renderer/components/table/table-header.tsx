import styles from "./table-header.module.scss";
import React from "react";
import type { Table } from "@tanstack/react-table";
import { flexRender } from '@tanstack/react-table';

interface TableHeaderProps<Data> {
  table: Table<Data>;
}

export function TableHeader<Data>({ table }: TableHeaderProps<Data>) {
  return (
    <thead>
      {table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map(header => (
            <th key={header.id}>
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
                </div>
              )}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  )
}
