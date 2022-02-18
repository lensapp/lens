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
  return (
    <div className={styles.placeholder}>
      {renderTableHeader.map((cellProps) => {
        return (
          <div key={cellProps.id} className={cellProps.className}>line</div>
        );
      })}
      {showExtraColumn && (
        <div className={styles.actionColumn}>line</div>
      )}
    </div>
  );
}
