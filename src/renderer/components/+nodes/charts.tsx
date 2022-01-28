/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useContext } from "react";
import { BarChart, cpuOptions, memoryOptions } from "../chart";
import { isMetricsEmpty, normalizeMetrics } from "../../../common/k8s-api/endpoints/metrics.api";
import { NoMetrics } from "../resource-metrics/no-metrics";
import { ResourceMetricsContext } from "../resource-metrics";
import { observer } from "mobx-react";
import type { ChartOptions, ChartPoint } from "chart.js";
import type { Theme } from "../../themes/store";
import { mapValues } from "lodash";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import activeThemeInjectable from "../../themes/active-theme.injectable";

export interface NodeChartsProps {}

interface Dependencies {
  activeTheme: IComputedValue<Theme>;
}

const NonInjectedNodeCharts = observer(({ activeTheme }: Dependencies & NodeChartsProps) => {
  const { metrics, tabId, object } = useContext(ResourceMetricsContext);
  const id = object.getId();
  const { chartCapacityColor } = activeTheme.get().colors;

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

export const NodeCharts = withInjectables<Dependencies, NodeChartsProps>(NonInjectedNodeCharts, {
  getProps: (di, props) => ({
    activeTheme: di.inject(activeThemeInjectable),
    ...props,
  }),
});
