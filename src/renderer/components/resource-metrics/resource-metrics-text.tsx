/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { PodMetricData } from "../../../common/k8s-api/endpoints";
import { getMetricLastPoints } from "../../../common/k8s-api/endpoints/metrics.api";
import { bytesToUnits } from "../../utils";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";

export interface ResourceMetricsTextProps {
  metrics: PodMetricData | null | undefined;
}

export function ResourceMetricsText({ metrics }: ResourceMetricsTextProps) {
  if (!metrics) {
    return null;
  }

  const { cpuUsage, cpuRequests, cpuLimits, memoryUsage, memoryRequests, memoryLimits } = getMetricLastPoints(metrics);

  return (
    <>
      <DrawerItem name="CPU" labelsOnly>
        {cpuUsage > 0 && <Badge label={`Usage: ${cpuUsage.toPrecision(2)}`}/>}
        {cpuRequests > 0 && <Badge label={`Requests: ${cpuRequests.toPrecision(2)}`}/>}
        {cpuLimits > 0 && <Badge label={`Limits: ${cpuLimits.toPrecision(2)}`}/>}
      </DrawerItem>
      <DrawerItem name="Memory" labelsOnly>
        {memoryUsage > 0 && <Badge label={`Usage: ${bytesToUnits(memoryUsage)}`}/>}
        {memoryRequests > 0 && <Badge label={`Requests: ${bytesToUnits(memoryRequests)}`}/>}
        {memoryLimits > 0 && <Badge label={`Limits: ${bytesToUnits(memoryLimits)}`}/>}
      </DrawerItem>
    </>
  );
}
