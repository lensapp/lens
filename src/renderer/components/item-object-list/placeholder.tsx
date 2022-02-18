/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./placeholder.module.scss";

import React from "react";
import type { TableCellProps } from "../table";
import { UserStore } from "../../../common/user-store";

interface Props {
  renderTableHeader: TableCellProps[];
  showExtraColumn?: boolean;
  tableId: string;
}

export function Placeholder({ renderTableHeader, showExtraColumn = true, tableId }: Props) {
  const linesNumber = 3;

  function renderLines() {
    const lines: React.ReactNode[] = [];

    for (let i = 0; i < linesNumber; i++) {
      lines.push(
        <div className={styles.line} style={{ opacity: 1 - i * .33 }}></div>,
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
      {filteredColumns.map((cellProps) => {
        return (
          <div key={cellProps.id} className={cellProps.className}>
            {renderLines()}
          </div>
        );
      })}
      {showExtraColumn && (
        <div className={styles.actionColumn}>{renderLines()}</div>
      )}
    </div>
  );
}
