/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./vertical-bar.module.scss";

import React, { HTMLAttributes } from "react";
import { cssNames } from "../../utils";

interface BarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
}

export function VerticalBar({ className, value, ...rest }: BarProps) {
  return (
    <div className={styles.verticalBar} data-testid="vertical-bar" {...rest}>
      <div className={cssNames(styles.value, className)} style={{ blockSize: `${value}%` }}></div>
    </div>
  );
}
