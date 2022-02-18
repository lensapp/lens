/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./placeholder.module.scss";

import React from "react";
import type { TableCellProps } from "../table";

interface Props {
  renderTableHeader: TableCellProps[];
  showExtraColumn?: boolean;
}

export function Placeholder({ renderTableHeader, showExtraColumn = true }: Props) {
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

  return (
    <div className={styles.placeholder}>
      {renderTableHeader.map((cellProps) => {
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
