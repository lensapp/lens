/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./catalog.module.scss";

import React from "react";
import type { RegisteredAdditionalCategoryColumn } from "./custom-category-columns";
import { getLabelBadges } from "./helpers";
import { KubeObject } from "../../../common/k8s-api/kube-object";

export const browseAllColumns: RegisteredAdditionalCategoryColumn[] = [
  {
    id: "kind",
    priority: 5,
    renderCell: entity => entity.kind,
    titleProps: {
      id: "kind",
      sortBy: "kind",
      title: "Kind",
    },
    sortCallback: entity => entity.kind,
  },
];

export const defaultCategoryColumns: RegisteredAdditionalCategoryColumn[] = [
  {
    id: "source",
    priority: 10,
    renderCell: entity => entity.getSource(),
    titleProps: {
      title: "Source",
      className: styles.sourceCell,
      id: "source",
      sortBy: "source",
    },
    sortCallback: entity => entity.getSource(),
    searchFilter: entity => `source=${entity.getSource()}`,
  },
  {
    id: "labels",
    priority: 20,
    renderCell: getLabelBadges,
    titleProps: {
      id: "labels",
      title: "Labels",
      className: `${styles.labelsCell} scrollable`,
    },
    searchFilter: entity => KubeObject.stringifyLabels(entity.metadata.labels),
  },
  {
    id: "status",
    priority: 30,
    renderCell: entity => (
      <span key="phase" className={entity.status.phase}>
        {entity.status.phase}
      </span>
    ),
    titleProps: {
      title: "Status",
      className: styles.statusCell,
      id: "status",
      sortBy: "status",
    },
    searchFilter: entity => entity.status.phase,
    sortCallback: entity => entity.status.phase,
  },
];
