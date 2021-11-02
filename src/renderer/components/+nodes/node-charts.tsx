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
import type { IClusterMetrics, Node } from "../../../common/k8s-api/endpoints";
import { BarChart, cpuOptions, memoryOptions } from "../chart";
import { isMetricsEmpty, normalizeMetrics } from "../../../common/k8s-api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { IResourceMetricsValue, ResourceMetricsContext } from "../resource-metrics";
import { observer } from "mobx-react";
import type { ChartOptions, ChartPoint } from "chart.js";
import { ThemeStore } from "../../theme.store";
import { mapValues } from "lodash";

type IContext = IResourceMetricsValue<Node, { metrics: IClusterMetrics }>;

export const NodeCharts = observer(() => {
  const { params: { metrics }, tabId, object } = useContext<IContext>(ResourceMetricsContext);
  const id = object.getId();
  const { chartCapacityColor } = ThemeStore.getInstance().activeTheme.colors;

  if (!metrics) {
    return null;
  }

  if (isMetricsEmpty(metrics)) {
    return <NoMetrics />;
  }

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

  const datasets = [
    // CPU
    [
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
    // Memory
    [
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
    // Disk
    [
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
    // Pods
    [
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
  ];

  const podOptions: ChartOptions = {
    scales: {
      yAxes: [{
        ticks: {
          callback: value => value,
        },
      }],
    },
    tooltips: {
      callbacks: {
        label: ({ datasetIndex, index }, { datasets }) => {
          const { label, data } = datasets[datasetIndex];
          const value = data[index] as ChartPoint;

          return `${label}: ${value.y}`;
        },
      },
    },
  };

  const options = [cpuOptions, memoryOptions, memoryOptions, podOptions];

  return (
    <BarChart
      name={`${object.getName()}-metric-${tabId}`}
      options={options[tabId]}
      data={{ datasets: datasets[tabId] }}
    />
  );
});
