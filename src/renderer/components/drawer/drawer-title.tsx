/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./drawer-title.module.css";
import React from "react";
import { cssNames } from "../../utils";

export interface DrawerTitleProps {
  className?: string;
  children: React.ReactNode;

  /**
   * Specifies how large this title is
   *
   * @default "title"
   */
  size?: "sub-title" | "title";
}

export function DrawerTitle({ className, children, size = "title" }: DrawerTitleProps) {
  return (
    <div
      className={cssNames(styles.DrawerTitle, className, {
        [styles.title]: size === "title",
        [styles["sub-title"]]: size === "sub-title",
      })}
    >
      {children}
    </div>
  );
}
