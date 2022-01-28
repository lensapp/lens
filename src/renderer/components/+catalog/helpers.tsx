/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./catalog.module.scss";
import React from "react";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { Badge } from "../badge";
import { searchUrlParam } from "../input";
import type { CatalogEntity } from "../../../common/catalog";

/**
 * @param entity The entity to render badge labels for
 */
export function getLabelBadges(entity: CatalogEntity, onClick?: (evt: React.MouseEvent<any, MouseEvent>) => void) {
  return KubeObject.stringifyLabels(entity.metadata.labels)
    .map(label => (
      <Badge
        scrollable
        className={styles.badge}
        key={label}
        label={label}
        title={label}
        onClick={(event) => {
          searchUrlParam.set(label);
          onClick?.(event);
          event.stopPropagation();
        }}
        expandable={false}
      />
    ));
}
