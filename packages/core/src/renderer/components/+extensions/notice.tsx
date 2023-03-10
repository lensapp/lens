/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./notice.module.scss";
import type { DOMAttributes } from "react";
import React from "react";
import { cssNames } from "@k8slens/utilities";

export interface NoticeProps extends DOMAttributes<any> {
  className?: string;
}

export function Notice(props: NoticeProps) {
  return (
    <div className={cssNames(styles.notice, props.className)}>
      {props.children}
    </div>
  );
}
