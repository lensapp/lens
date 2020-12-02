import React from "react";
import { Trans } from "@lingui/macro";
import { IPodMetrics } from "../../api/endpoints";
import { getMetricLastPoints, IMetrics } from "../../api/endpoints/metrics.api";
import { bytesToUnits } from "../../utils";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";

interface Props {
  metrics: IPodMetrics<IMetrics>;
}

export function ResourceMetricsText(props: Props) {
  if (!props.metrics) return null;
  const metrics = getMetricLastPoints(props.metrics);
  const { cpuUsage, cpuRequests, cpuLimits, memoryUsage, memoryRequests, memoryLimits } = metrics;

  return (
    <>
      <DrawerItem name={<Trans>CPU</Trans>} labelsOnly>
        {cpuUsage > 0 && <Badge label={`Usage: ${cpuUsage.toPrecision(2)}`}/>}
        {cpuRequests > 0 && <Badge label={`Requests: ${cpuRequests.toPrecision(2)}`}/>}
        {cpuLimits > 0 && <Badge label={`Limits: ${cpuLimits.toPrecision(2)}`}/>}
      </DrawerItem>
      <DrawerItem name={<Trans>Memory</Trans>} labelsOnly>
        {memoryUsage > 0 && <Badge label={`Usage: ${bytesToUnits(memoryUsage)}`}/>}
        {memoryRequests > 0 && <Badge label={`Requests: ${bytesToUnits(memoryRequests)}`}/>}
        {memoryLimits > 0 && <Badge label={`Limits: ${bytesToUnits(memoryLimits)}`}/>}
      </DrawerItem>
    </>
  );
}