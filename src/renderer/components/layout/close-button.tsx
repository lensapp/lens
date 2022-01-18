/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./close-button.module.scss";

import React, { HTMLAttributes } from "react";
import { Icon } from "../icon";

interface Props extends HTMLAttributes<HTMLDivElement> {
}

export function CloseButton(props: Props) {
  return (
    <div {...props}>
      <div className={styles.closeButton} role="button" aria-label="Close">
        <Icon material="close" className={styles.icon}/>
      </div>
      <div className={styles.esc} aria-hidden="true">
        ESC
      </div>
    </div>
  );
}
