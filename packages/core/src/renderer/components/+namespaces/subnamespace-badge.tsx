import styles from "./subnamespace-badge.module.scss";

import React from "react";
import type { Namespace } from "../../../common/k8s-api/endpoints";

interface SubnamespaceBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  namespace: Namespace;
}

export function SubnamespaceBadge({ namespace, ...other }: SubnamespaceBadgeProps) {
  if (!namespace.getAnnotations().find(annotation => annotation.includes("hnc.x-k8s.io/subnamespace-of"))) {
    return null;
  }

  return (
    <span
      className={styles.subnamespaceBadge}
      data-testid={`subnamespace-badge-for-${namespace.getId()}`}
      {...other}
    >
      S
    </span>
  );
}