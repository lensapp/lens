/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { categoryVersion } from "../../common/catalog";
import type { CatalogCategorySpec, CatalogEntityConstructor } from "../../common/catalog";
import { KubernetesCluster, KubernetesClusterCategory as KubernetesClusterCommonCategory } from "../../common/catalog-entities";
import styles from "./kubernetes-cluster.module.scss";

export class KubernetesClusterCategory extends KubernetesClusterCommonCategory {
  public spec: CatalogCategorySpec = {
    group: "entity.k8slens.dev",
    versions: [
      categoryVersion("v1alpha1", KubernetesCluster as CatalogEntityConstructor<KubernetesCluster>),
    ],
    names: {
      kind: "KubernetesCluster",
    },
    displayColumns: [
      {
        id: "distro",
        priority: 30,
        renderCell: entity => (
          <span key="distro">
            {(entity as KubernetesCluster).k8sDistro}
          </span>
        ),
        titleProps: {
          title: "Distro",
        },
      },
      {
        id: "api-version",
        priority: 30,
        renderCell: entity => (
          <span key="api-version">
            {(entity as KubernetesCluster).k8sVersion}
          </span>
        ),
        titleProps: {
          title: "Version",
        },
      },
      {
        id: "status",
        priority: 50,
        renderCell: entity => (
          <span key="phase" className={entity.status.phase}>
            {entity.status.phase}
          </span>
        ),
        titleProps: {
          title: "Status",
          className: styles.statusCell,
        },
        searchFilter: entity => entity.status.phase,
        sortCallback: entity => entity.status.phase,
      },
    ],
  };
}
