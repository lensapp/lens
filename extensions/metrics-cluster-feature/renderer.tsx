/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Common, Renderer } from "@k8slens/extensions";
import { MetricsSettings } from "./src/metrics-settings";

export default class ClusterMetricsFeatureExtension extends Renderer.LensExtension {
  entitySettings = [
    {
      apiVersions: ["entity.k8slens.dev/v1alpha1"],
      kind: "KubernetesCluster",
      title: "Lens Metrics",
      priority: 5,
      components: {
        View: ({ entity = null }: { entity: Common.Catalog.KubernetesCluster }) => {
          return (
            <MetricsSettings cluster={entity} />
          );
        },
      },
    },
  ];
}
