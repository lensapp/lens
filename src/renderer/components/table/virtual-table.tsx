/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

 import React from "react";
 import { flexRender, Row } from "@tanstack/react-table"
 import type { Table } from "@tanstack/react-table";
 import { TableHeader } from "./table-header";
 import { useVirtualizer } from "@tanstack/react-virtual";
 
 interface TableProps<T> {
   table: Table<T>;
   className?: string;
 }
 
 export function VirtualTable<Data>({ className, table }: TableProps<Data>) {
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  
  const { rows } = table.getRowModel()
  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 55,
    overscan: 5,
    count: rows.length
  })

  console.log(`${rowVirtualizer.getTotalSize()}px`)
  
  return (
    <div className={className} ref={tableContainerRef}>
      <table style={{ height: 1590 }}>
        <TableHeader table={table}/>
        <tbody>
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const row = rows[virtualRow.index] as Row<Data>
            return (
              <tr
                key={row.id}
                // style={{ height: 30 }}
              >
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
 