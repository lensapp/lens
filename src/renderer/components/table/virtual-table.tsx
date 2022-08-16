/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

 import React from "react";
 import { flexRender, Row } from '@tanstack/react-table'
 import type { Table } from "@tanstack/react-table";
 import { TableHeader } from "./table-header";
 import { useVirtual } from 'react-virtual'
 
 interface TableProps<T> {
   table: Table<T>;
   className?: string;
 }
 
 export function VirtualTable<Data>({ className, table }: TableProps<Data>) {
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  
  const { rows } = table.getRowModel()
  const rowVirtualizer = useVirtual({
    parentRef: tableContainerRef,
    size: rows.length,
    overscan: 10,
  })
  const { virtualItems: virtualRows } = rowVirtualizer;

  return (
    <div className={className} ref={tableContainerRef}>
      <table>
        <TableHeader table={table}/>
        <tbody>
          {virtualRows.map(virtualRow => {
            const row = rows[virtualRow.index] as Row<Data>
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => {
                  return (
                    <td key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
 