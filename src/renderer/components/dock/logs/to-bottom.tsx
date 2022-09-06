/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./to-bottom.module.scss";

import React from "react";
import { Icon } from "../../icon";

export function ToBottom({ onClick }: { onClick: () => void }) {
  return (
    <button
      className={styles.ToBottom}
      onClick={evt => {
        evt.currentTarget.blur();
        onClick();
      }}
    >
      <Icon small material="expand_more" />
    </button>
  );
}
