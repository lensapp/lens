/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "../catalog.module.scss";
import React from "react";
import type { RegisteredAdditionalCategoryColumn } from "../custom-category-columns";
import { KubeObject } from "../../../../common/k8s-api/kube-object";
import { getInjectable } from "@ogre-tools/injectable";
import getLabelBadgesInjectable from "../get-label-badges.injectable";

const defaultCategoryColumnsInjectable = getInjectable({
  id: "default-category-columns",
  instantiate: (di): RegisteredAdditionalCategoryColumn[] => {
    const getLabelBadges = di.inject(getLabelBadgesInjectable);

    return [
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
  },
});

export default defaultCategoryColumnsInjectable;
