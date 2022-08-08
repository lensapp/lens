/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { flexRender } from '@tanstack/react-table'
import type { Table } from "@tanstack/react-table";
import { TableHeader } from "./table-header";

interface TableProps<T> {
  table: Table<T>;
  className?: string;
}

export function Table<Data>({ className, table }: TableProps<Data>) {
  return (
    <div className={className}>
      <table>
        <TableHeader table={table}/>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
