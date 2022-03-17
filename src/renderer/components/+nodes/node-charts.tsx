/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useContext } from "react";
import type { ChartDataSets } from "../chart";
import { BarChart } from "../chart";
import { isMetricsEmpty, normalizeMetrics } from "../../../common/k8s-api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { ResourceMetricsContext } from "../resource-metrics";
import { observer } from "mobx-react";
import { mapValues } from "lodash";
import { type MetricsTab, metricTabOptions } from "../chart/options";
import { ThemeStore } from "../../theme.store";

export const NodeCharts = observer(() => {
  const { metrics, tab, object } = useContext(ResourceMetricsContext) ?? {};

  if (!metrics || !object || !tab) return null;
  if (isMetricsEmpty(metrics)) return <NoMetrics/>;

  const id = object.getId();
  const { chartCapacityColor } = ThemeStore.getInstance().activeTheme.colors;
  const {
    memoryUsage,
    workloadMemoryUsage,
    memoryRequests,
    memoryCapacity,
    memoryAllocatableCapacity,
    cpuUsage,
    cpuRequests,
    cpuCapacity,
    cpuAllocatableCapacity,
    podUsage,
    podCapacity,
    fsSize,
    fsUsage,
  } = mapValues(metrics, metric => normalizeMetrics(metric).data.result[0].values);

  const datasets: Partial<Record<MetricsTab, ChartDataSets[]>> = {
    CPU: [
      {
        id: `${id}-cpuUsage`,
        label: `Usage`,
        tooltip: `CPU cores usage`,
        borderColor: "#3D90CE",
        data: cpuUsage.map(([x, y]) => ({ x, y })),
      },
      {
        id: `${id}-cpuRequests`,
        label: `Requests`,
        tooltip: `CPU requests`,
        borderColor: "#30b24d",
        data: cpuRequests.map(([x, y]) => ({ x, y })),
      },
      {
        id: `${id}-cpuAllocatableCapacity`,
        label: `Allocatable Capacity`,
        tooltip: `CPU allocatable capacity`,
        borderColor: "#032b4d",
        data: cpuAllocatableCapacity.map(([x, y]) => ({ x, y })),
      },
      {
        id: `${id}-cpuCapacity`,
        label: `Capacity`,
        tooltip: `CPU capacity`,
        borderColor: chartCapacityColor,
        data: cpuCapacity.map(([x, y]) => ({ x, y })),
      },
    ],
    Memory: [
      {
        id: `${id}-memoryUsage`,
        label: `Usage`,
        tooltip: `Memory usage`,
        borderColor: "#c93dce",
        data: memoryUsage.map(([x, y]) => ({ x, y })),
      },
      {
        id: `${id}-workloadMemoryUsage`,
        label: `Workload Memory Usage`,
        tooltip: `Workload memory usage`,
        borderColor: "#9cd3ce",
        data: workloadMemoryUsage.map(([x, y]) => ({ x, y })),
      },
      {
        id: "memoryRequests",
        label: `Requests`,
        tooltip: `Memory requests`,
        borderColor: "#30b24d",
        data: memoryRequests.map(([x, y]) => ({ x, y })),
      },
      {
        id: `${id}-memoryAllocatableCapacity`,
        label: `Allocatable Capacity`,
        tooltip: `Memory allocatable capacity`,
        borderColor: "#032b4d",
        data: memoryAllocatableCapacity.map(([x, y]) => ({ x, y })),
      },
      {
        id: `${id}-memoryCapacity`,
        label: `Capacity`,
        tooltip: `Memory capacity`,
        borderColor: chartCapacityColor,
        data: memoryCapacity.map(([x, y]) => ({ x, y })),
      },
    ],
    Disk: [
      {
        id: `${id}-fsUsage`,
        label: `Usage`,
        tooltip: `Node filesystem usage in bytes`,
        borderColor: "#ffc63d",
        data: fsUsage.map(([x, y]) => ({ x, y })),
      },
      {
        id: `${id}-fsSize`,
        label: `Size`,
        tooltip: `Node filesystem size in bytes`,
        borderColor: chartCapacityColor,
        data: fsSize.map(([x, y]) => ({ x, y })),
      },
    ],
    Pods: [
      {
        id: `${id}-podUsage`,
        label: `Usage`,
        tooltip: `Number of running Pods`,
        borderColor: "#30b24d",
        data: podUsage.map(([x, y]) => ({ x, y })),
      },
      {
        id: `${id}-podCapacity`,
        label: `Capacity`,
        tooltip: `Node Pods capacity`,
        borderColor: chartCapacityColor,
        data: podCapacity.map(([x, y]) => ({ x, y })),
      },
    ],
  };

  return (
    <BarChart
      name={`${object.getName()}-metric-${tab}`}
      options={metricTabOptions[tab]}
      data={{ datasets: datasets[tab] }}
    />
  );
});
