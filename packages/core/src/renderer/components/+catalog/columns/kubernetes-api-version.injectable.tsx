/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import type { KubernetesCluster } from "../../../../common/catalog-entities";
import { customCatalogCategoryColumnInjectionToken } from "./custom-token";

const kubernetesApiVersionColumnInjectable = getInjectable({
  id: "kubernetes-api-version-column",
  instantiate: () => ({
    group: "entity.k8slens.dev",
    kind: "KubernetesCluster",
    registration: {
      id: "version",
      priority: 30,
      renderCell: entity => {
        const k8sVersion = (entity as KubernetesCluster).metadata.kubeVersion;

        return (
          <span key="version">
            {k8sVersion === "unknown" ? "" : k8sVersion}
          </span>
        );
      },
      titleProps: {
        title: "Version",
      },
    },
  }),
  injectionToken: customCatalogCategoryColumnInjectionToken,
});

export default kubernetesApiVersionColumnInjectable;
