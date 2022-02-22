/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./placeholder.module.scss";

import React from "react";
import { TableCell, TableCellProps } from "../table";
import { UserStore } from "../../../common/user-store";

interface Props {
  renderTableHeader: TableCellProps[];
  showActionsColumn?: boolean;
  showCheckColumn?: boolean;
  tableId: string;
}

export function Placeholder({ renderTableHeader, showActionsColumn: showExtraColumn = true, showCheckColumn, tableId }: Props) {
  const linesNumber = 3;

  function renderLines() {
    const lines: React.ReactNode[] = [];

    for (let i = 0; i < linesNumber; i++) {
      lines.push(
        <div className={styles.line} style={{ opacity: 1 - i * .4 }}></div>,
      );
    }

    return React.Children.toArray(lines);
  }

  function showColumn({ id: columnId, showWithColumn }: TableCellProps): boolean {
    return !UserStore.getInstance().isTableColumnHidden(tableId, columnId, showWithColumn);
  }

  const filteredColumns = renderTableHeader.filter(showColumn);

  return (
    <div className={styles.placeholder} aria-hidden="true">
      {showCheckColumn && (
        <div className={styles.checkerColumn}>{renderLines()}</div>
      )}
      {filteredColumns.map((cellProps, index) => {
        return (
          <TableCell key={cellProps.id ?? index} className={cellProps.className}>
            {cellProps.title && renderLines()}
          </TableCell>
        );
      })}
      {showExtraColumn && (
        <div className={styles.actionColumn}>{renderLines()}</div>
      )}
    </div>
  );
}
