/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./subnamespace-badge.module.scss";

import React from "react";
import { Tooltip } from "@k8slens/tooltip";
import { cssNames } from "@k8slens/utilities";

interface SubnamespaceBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  id: string;
}

export function SubnamespaceBadge({ id, className, ...other }: SubnamespaceBadgeProps) {
  return (
    <>
      <span
        className={cssNames(styles.subnamespaceBadge, className)}
        data-testid={id}
        id={id}
        {...other}
      >
        S
      </span>
      <Tooltip targetId={id}>
        Subnamespace
      </Tooltip>
    </>
  );
}
