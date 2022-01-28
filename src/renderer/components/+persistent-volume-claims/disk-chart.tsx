/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useContext } from "react";
import { observer } from "mobx-react";
import { BarChart, ChartDataSets, memoryOptions } from "../chart";
import { isMetricsEmpty, normalizeMetrics } from "../../../common/k8s-api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { ResourceMetricsContext } from "../resource-metrics";
import type { Theme } from "../../themes/store";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import activeThemeInjectable from "../../themes/active-theme.injectable";

export interface VolumeClaimDiskChartProps {}

interface Dependencies {
  activeTheme: IComputedValue<Theme>;
}

const NonInjectedVolumeClaimDiskChart = observer(({ activeTheme }: Dependencies & VolumeClaimDiskChartProps) => {
  const { metrics, object } = useContext(ResourceMetricsContext);
  const { chartCapacityColor } = activeTheme.get().colors;
  const id = object.getId();

  if (!metrics) return null;
  if (isMetricsEmpty(metrics)) return <NoMetrics/>;

  const { diskUsage, diskCapacity } = metrics;
  const usage = normalizeMetrics(diskUsage).data.result[0].values;
  const capacity = normalizeMetrics(diskCapacity).data.result[0].values;

  const datasets: ChartDataSets[] = [
    {
      id: `${id}-diskUsage`,
      label: `Usage`,
      tooltip: `Volume disk usage`,
      borderColor: "#ffc63d",
      data: usage.map(([x, y]) => ({ x, y })),
    },
    {
      id: `${id}-diskCapacity`,
      label: `Capacity`,
      tooltip: `Volume disk capacity`,
      borderColor: chartCapacityColor,
      data: capacity.map(([x, y]) => ({ x, y })),
    },
  ];

  return (
    <BarChart
      className="VolumeClaimDiskChart flex box grow column"
      name={`pvc-${object.getName()}-disk`}
      timeLabelStep={10}
      options={memoryOptions}
      data={{ datasets }}
    />
  );
});

export const VolumeClaimDiskChart = withInjectables<Dependencies, VolumeClaimDiskChartProps>(NonInjectedVolumeClaimDiskChart, {
  getProps: (di, props) => ({
    activeTheme: di.inject(activeThemeInjectable),
    ...props,
  }),
});
