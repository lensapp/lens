/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useContext } from "react";
import { observer } from "mobx-react";
import type { IPvcMetrics, PersistentVolumeClaim } from "../../../common/k8s-api/endpoints";
import { BarChart, ChartDataSets, memoryOptions } from "../chart";
import { isMetricsEmpty, normalizeMetrics } from "../../../common/k8s-api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { IResourceMetricsValue, ResourceMetricsContext } from "../resource-metrics";
import { ThemeStore } from "../../theme.store";

type IContext = IResourceMetricsValue<PersistentVolumeClaim, { metrics: IPvcMetrics }>;

export const VolumeClaimDiskChart = observer(() => {
  const { params: { metrics }, object } = useContext<IContext>(ResourceMetricsContext);
  const { chartCapacityColor } = ThemeStore.getInstance().activeTheme.colors;
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
