/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import type { KubernetesCluster } from "../../../../common/catalog-entities";
import { customCatalogCategoryColumnInjectionToken } from "./custom-token";

const kubernetesDistributionColumnInjectable = getInjectable({
  id: "kubernetes-distribution-column",
  instantiate: () => ({
    group: "entity.k8slens.dev",
    kind: "KubernetesCluster",
    registration: {
      id: "distro",
      priority: 30,
      renderCell: entity => {
        const k8sDistro = (entity as KubernetesCluster).metadata.distro;

        return (
          <span key="distro">
            {k8sDistro === "unknown" ? "" : k8sDistro}
          </span>
        );
      },
      titleProps: {
        title: "Distro",
      },
    },
  }),
  injectionToken: customCatalogCategoryColumnInjectionToken,
});

export default kubernetesDistributionColumnInjectable;

