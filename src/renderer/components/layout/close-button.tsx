/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./close-button.module.scss";

import type { HTMLAttributes } from "react";
import React from "react";
import { Icon } from "../icon";

export interface CloseButtonProps extends HTMLAttributes<HTMLDivElement> {
}

export function CloseButton(props: CloseButtonProps) {
  return (
    <div {...props}>
      <div
        className={styles.closeButton}
        role="button"
        aria-label="Close"
      >
        <Icon material="close" className={styles.icon}/>
      </div>
      <div className={styles.esc} aria-hidden="true">
        ESC
      </div>
    </div>
  );
}
