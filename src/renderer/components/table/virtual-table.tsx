/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { flexRender, Row } from "@tanstack/react-table"
import type { Table, Cell, Header } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { VirtualTableHeader } from "./virtual-table-header";
 
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
    count: rows.length,
    paddingStart: 50 // header width
  })

  return (
    <>
      <div className={className} ref={tableContainerRef}>
        <table style={{
          height: rowVirtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}>
          <VirtualTableHeader table={table} getColumnSizeStyles={getCellWidthStyles}/>
          <tbody>
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const row = rows[virtualRow.index] as Row<Data>

              return (
                <div
                  key={virtualRow.index}
                  ref={virtualRow.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    display: 'flex',
                  }}
                >
                  {row.getVisibleCells().map(cell => {
                    return (
                      <div key={cell.id} style={getCellWidthStyles(table, cell)}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
 
function getCellWidthStyles<T>(table: Table<T>, cell: Cell<T, unknown> | Header<T, unknown>): React.CSSProperties {
  const cellResized = cell.column.id in table.getState().columnSizing;
  const cellFixed = !cell.column.getCanResize();

  if (cellResized || cellFixed) {
    return {
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: cell.column.getSize()
    }
  }

  return {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: "0%",
  }
}