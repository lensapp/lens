/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";
import { getInjectionToken } from "@ogre-tools/injectable";

export type ClusterOverviewUIBlock = {
  id: string;
  Component: React.ElementType;
  orderNumber: number;
};

export const clusterOverviewUIBlockInjectionToken = getInjectionToken<ClusterOverviewUIBlock>({
  id: "cluster-overview-ui-block-injection-token",
});

export type KubeObjectDetailMetrics = {
  id: string;
  Component: React.ElementType;
};

export const podDetailsMetricsInjectionToken = getInjectionToken<KubeObjectDetailMetrics>({
  id: "pod-details-metrics-injection-token",
});
