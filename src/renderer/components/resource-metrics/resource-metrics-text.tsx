/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { MetricData } from "../../../common/k8s-api/endpoints/metrics.api";
import { getMetricLastPoints } from "../../../common/k8s-api/endpoints/metrics.api";
import { bytesToUnits } from "../../utils";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";

export interface ResourceMetricsTextMetrics {
  cpuUsage?: MetricData;
  cpuRequests?: MetricData;
  cpuLimits?: MetricData;
  memoryUsage?: MetricData;
  memoryRequests?: MetricData;
  memoryLimits?: MetricData;
}

export interface ResourceMetricsTextProps {
  metrics: ResourceMetricsTextMetrics | null | undefined;
}

export function ResourceMetricsText({ metrics }: ResourceMetricsTextProps) {
  if (!metrics) {
    return null;
  }

  const {
    cpuUsage = 0,
    memoryUsage = 0,
  } = getMetricLastPoints(metrics);

  return (
    <>
      <DrawerItem name="CPU" labelsOnly>
        {cpuUsage > 0 && <Badge label={`Usage: ${cpuUsage.toPrecision(2)}`}/>}
      </DrawerItem>
      <DrawerItem name="Memory" labelsOnly>
        {memoryUsage > 0 && <Badge label={`Usage: ${bytesToUnits(memoryUsage)}`}/>}
      </DrawerItem>
    </>
  );
}
