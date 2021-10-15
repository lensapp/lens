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
import type { IPodMetrics } from "../../../common/k8s-api/endpoints";
import { BarChart, ChartDataSets } from "../chart";
import { FlattenedMetrics, flattenMatricResults, isMetricsEmpty } from "../../../common/k8s-api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { ResourceMetricsContext } from "../resource-metrics";
import { ThemeStore } from "../../theme.store";
import { ContainerMetricsTab, getBarChartOptions } from "../metrics-helpers";

function getDatasets(tab: string, metrics: FlattenedMetrics<IPodMetrics>): ChartDataSets[] | null {
  const { chartCapacityColor } = ThemeStore.getInstance().activeTheme.colors;
  const {
    cpuUsage,
    cpuRequests,
    cpuLimits,
    memoryUsage,
    memoryRequests,
    memoryLimits,
    fsUsage
  } = metrics;

  switch (tab) {
    case ContainerMetricsTab.CPU:
      return [
        {
          id: "cpuUsage",
          label: "Usage",
          tooltip: "CPU cores usage",
          borderColor: "#3D90CE",
          data: cpuUsage.map(([x, y]) => ({ x, y }))
        },
        {
          id: "cpuRequests",
          label: "Requests",
          tooltip: "CPU requests",
          borderColor: "#30b24d",
          data: cpuRequests.map(([x, y]) => ({ x, y }))
        },
        {
          id: "cpuLimits",
          label: "Limits",
          tooltip: "CPU limits",
          borderColor: chartCapacityColor,
          data: cpuLimits.map(([x, y]) => ({ x, y }))
        }
      ];
    case ContainerMetricsTab.MEMORY:
      return [
        {
          id: "memoryUsage",
          label: "Usage",
          tooltip: "Memory usage",
          borderColor: "#c93dce",
          data: memoryUsage.map(([x, y]) => ({ x, y }))
        },
        {
          id: "memoryRequests",
          label: "Requests",
          tooltip: "Memory requests",
          borderColor: "#30b24d",
          data: memoryRequests.map(([x, y]) => ({ x, y }))
        },
        {
          id: "memoryLimits",
          label: "Limits",
          tooltip: "Memory limits",
          borderColor: chartCapacityColor,
          data: memoryLimits.map(([x, y]) => ({ x, y }))
        }
      ];
    case ContainerMetricsTab.FILESYSTEM:
      return [
        {
          id: "fsUsage",
          label: "Usage",
          tooltip: "Bytes consumed on this filesystem",
          borderColor: "#ffc63d",
          data: fsUsage.map(([x, y]) => ({ x, y }))
        }
      ];
    default:
      return null;
  }
}

export const ContainerCharts = observer(() => {
  const { metrics, tab } = useContext(ResourceMetricsContext);

  if (isMetricsEmpty(metrics)) {
    return <NoMetrics />;
  }

  const datasets = getDatasets(tab, flattenMatricResults(metrics as IPodMetrics));

  if (!datasets) {
    return <NoMetrics />;
  }

  return (
    <BarChart
      name={`metrics-${tab}`}
      options={getBarChartOptions(tab)}
      data={{ datasets }}
    />
  );
});
