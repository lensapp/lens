/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./drawer-title.module.css";
import React from "react";
import type { StrictReactNode } from "@k8slens/utilities";
import { cssNames } from "@k8slens/utilities";

export interface DrawerTitleProps {
  className?: string;
  children?: StrictReactNode;

  /**
   * @deprecated Prefer passing the value as `children`
   */
  title?: StrictReactNode;

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
